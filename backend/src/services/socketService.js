import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Holding from "../models/Holding.js";
import Watchlist from "../models/Watchlist.js";
import { getQuotes } from "./finnhubService.js";
import { shouldTriggerAlert, buildAlertMessage } from "../utils/alertEvaluator.js";

let io;

// symbol -> Set of socket ids subscribed to it (so we only poll Finnhub
// for symbols someone is actually watching right now)
const symbolSubscribers = new Map();

// userId -> socket id, used to push portfolio-wide updates to a specific user
const userSockets = new Map();

const POLL_INTERVAL_MS = 15000; // stay well under Finnhub's 60/min free limit
const ALERT_CHECK_INTERVAL_MS = 30000; // checked less frequently than live ticks

/**
 * Initializes Socket.io on top of the existing HTTP server and starts the
 * background polling loop that pushes live quote updates to subscribed
 * clients.
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate the socket connection using the same JWT used for REST calls
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    userSockets.set(socket.userId, socket.id);

    socket.on("subscribe", (symbols = []) => {
      symbols.forEach((symbol) => {
        const key = symbol.toUpperCase();
        if (!symbolSubscribers.has(key)) symbolSubscribers.set(key, new Set());
        symbolSubscribers.get(key).add(socket.id);
      });
    });

    socket.on("unsubscribe", (symbols = []) => {
      symbols.forEach((symbol) => {
        const key = symbol.toUpperCase();
        symbolSubscribers.get(key)?.delete(socket.id);
      });
    });

    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
      symbolSubscribers.forEach((subs) => subs.delete(socket.id));
    });
  });

  startPollingLoop();
  startAlertCheckLoop();

  return io;
};

const startPollingLoop = () => {
  setInterval(async () => {
    const symbols = [...symbolSubscribers.keys()].filter(
      (symbol) => symbolSubscribers.get(symbol).size > 0
    );
    if (symbols.length === 0) return;

    try {
      const quotes = await getQuotes(symbols);

      symbols.forEach((symbol) => {
        const subscriberSocketIds = symbolSubscribers.get(symbol);
        if (!subscriberSocketIds || subscriberSocketIds.size === 0) return;

        subscriberSocketIds.forEach((socketId) => {
          io.to(socketId).emit("price:update", {
            symbol,
            quote: quotes[symbol],
          });
        });
      });
    } catch (err) {
      console.error("Price polling loop error:", err.message);
    }
  }, POLL_INTERVAL_MS);
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io has not been initialized yet.");
  return io;
};

/**
 * Periodically checks every enabled, not-yet-triggered watchlist alert
 * against a fresh quote, and pushes a "alert:triggered" event to the
 * owning user if they're currently connected. Only checks symbols that
 * actually have an active alert configured, to keep the Finnhub call
 * volume small regardless of how many users are connected.
 */
const startAlertCheckLoop = () => {
  setInterval(async () => {
    try {
      const pendingAlerts = await Watchlist.find({
        alertEnabled: true,
        targetPrice: { $ne: null },
        alertTriggeredAt: null,
      });

      if (pendingAlerts.length === 0) return;

      const symbols = [...new Set(pendingAlerts.map((a) => a.symbol))];
      const quotes = await getQuotes(symbols);

      for (const alert of pendingAlerts) {
        const quote = quotes[alert.symbol];
        if (!quote) continue;

        if (shouldTriggerAlert(alert, quote.current)) {
          alert.alertTriggeredAt = new Date();
          await alert.save();

          const message = buildAlertMessage(alert, quote.current);
          const socketId = userSockets.get(alert.user.toString());

          if (socketId && io) {
            io.to(socketId).emit("alert:triggered", {
              symbol: alert.symbol,
              targetPrice: alert.targetPrice,
              currentPrice: quote.current,
              direction: alert.alertDirection,
              message,
            });
          }
          // If the user isn't connected right now, the alert is still
          // marked triggered in the DB and will simply show as "triggered"
          // next time they load the watchlist page.
        }
      }
    } catch (err) {
      console.error("Alert check loop error:", err.message);
    }
  }, ALERT_CHECK_INTERVAL_MS);
};
