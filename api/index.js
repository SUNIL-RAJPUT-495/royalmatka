import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./services/auth/routes/auth.routes.js";
import initializeAviatorSockets from "./services/aviator/socket/index.js";
import aviatorRoutes from "./services/aviator/routes/aviator.routes.js";
import marketRoutes from "./services/matka/routes/market.routes.js";
import paymentRoutes from "./services/auth/routes/payment.routes.js";
import contactRoutes from "./services/auth/routes/contact.routes.js";
import bidRoutes from "./services/matka/routes/bid.routes.js";
import settingsRoutes from "./services/matka/routes/settings.routes.js";
import chatRoutes from "./services/chat/routes/chat.routes.js";
import notificationRoutes from "./services/auth/routes/notification.routes.js";
import cashinoRoutes from "./services/cashino/routes/cashino.routes.js";
import GameEngine from "./services/aviator/game/GameEngine.js";
import dpbossAutoSyncService from "./services/matka/services/dpbossAutoSyncService.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();
app.set("trust proxy", true);

// Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: true, // Dynamically reflects request origin to allow credentials
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Headers",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "token"
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Mount API routes
app.use("/api/user", authRoutes);
app.use("/api/aviator", aviatorRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/matka", marketRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/bid", bidRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/user/notification", notificationRoutes);
app.use("/api/cashino", cashinoRoutes);
app.use("/api/casino", cashinoRoutes);

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running 🚀",
  });
});

// API Route Example
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

// Database Status Diagnostic Route
app.get("/api/db-status", (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  const readyState = mongoose.connection.readyState;
  res.status(200).json({
    success: true,
    connected: readyState === 1,
    status: states[readyState] || "unknown",
    readyState: readyState
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5010;

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Initialize WebSocket server directly on the Express server instance
  initializeAviatorSockets(server);

  // Initialize and start the Game loop engine
  GameEngine.start();

  // Start DPBOSS Live API Auto-Sync & Midnight Reset Service
  dpbossAutoSyncService.start();
});