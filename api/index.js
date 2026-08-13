import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";

import connectDB from "./config/db.js";
import authRoutes from "./services/auth/routes/auth.routes.js";
import initializeAviatorSockets from "./services/aviator/socket/index.js";
import GameEngine from "./services/aviator/game/GameEngine.js";

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use("/api", limiter);

// Mount API routes
app.use("/api/user", authRoutes);

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

const PORT = process.env.PORT || 5000;

// Start Express HTTP Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Start Dedicated WebSocket Server on port 8082 for Aviator Game Loop
const socketServer = http.createServer(app);
initializeAviatorSockets(socketServer);
socketServer.listen(8082, () => {
  console.log("🎮 Aviator WebSocket Server running on port 8082");
  
  // Initialize and start the Game loop engine
  GameEngine.start();
});