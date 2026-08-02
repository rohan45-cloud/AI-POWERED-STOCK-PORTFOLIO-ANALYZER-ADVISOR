import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./services/socketService.js";

// Catch programming errors that happen outside the request-response cycle
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const httpServer = createServer(app);
  initSocket(httpServer);

  const server = httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    console.log(`Socket.io live price feed initialized`);
  });

  // Catch unhandled promise rejections (e.g. failed DB queries not wrapped properly)
  process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.error(err.name, err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
