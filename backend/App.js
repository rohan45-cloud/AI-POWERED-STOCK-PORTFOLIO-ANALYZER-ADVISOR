import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import insightsRoutes from "./routes/insightsRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const app = express();

// --- Security middleware ---
app.use(helmet());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true, // allow cookies to be sent
    })
);

// --- General rate limiting (applies to all routes) ---
const globalLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", globalLimiter);

// --- Body parsing ---
app.use(express.json({ limit: "10kb" })); // limit body size to mitigate DoS via large payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// --- Logging (dev only) ---
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// --- Health check ---
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ success: true, message: "API is healthy", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/portfolio", portfolioRoutes);
app.use("/api/v1/stocks", stockRoutes);
app.use("/api/v1/insights", insightsRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);

// --- 404 handler for unmatched routes ---
app.all("*", (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// --- Global error handler (must be last) ---
app.use(errorHandler);

export default app;