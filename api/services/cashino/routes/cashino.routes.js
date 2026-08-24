import express from "express";
import {
  getWhoAmI,
  getProviders,
  getGames,
  getGgrBalance,
  launchGame,
  handleCallback,
  getTransactions,
  proxyImage,
  toggleGameStatus
} from "../controllers/cashino.controller.js";
import { verifyToken, verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Public / Client Catalog Routes
router.get("/whoami", getWhoAmI);
router.get("/providers", getProviders);
router.get("/games", getGames);
router.get("/proxy-image", proxyImage);

// Server-to-Server Settlement Callback
router.post("/callback", handleCallback);

// User Authenticated Game Launch
router.post("/launch", verifyToken, launchGame);

// Admin Routes
router.get("/ggr-balance", verifyAdmin, getGgrBalance);
router.get("/transactions", verifyAdmin, getTransactions);
router.post("/toggle-game-status", verifyAdmin, toggleGameStatus);

export default router;
