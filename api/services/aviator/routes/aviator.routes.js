import express from "express";
import {
  getSettings,
  updateSettings,
  forceCrashNext,
  forceCrashNow,
  getStats,
} from "../controllers/aviator.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Aviator Endpoints
router.get("/settings", getSettings);
router.post("/settings", updateSettings);
router.post("/force-crash-next", forceCrashNext);
router.post("/force-crash-now", forceCrashNow);
router.get("/stats", getStats);

// Protected Admin Aliases
router.get("/admin/settings", getSettings);
router.post("/admin/settings", updateSettings);
router.post("/admin/force-crash-next", forceCrashNext);
router.post("/admin/force-crash-now", forceCrashNow);
router.get("/admin/stats", getStats);

export default router;
