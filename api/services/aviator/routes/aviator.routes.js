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

// Aviator Admin Endpoints
router.get("/settings", verifyAdmin, getSettings);
router.post("/settings", verifyAdmin, updateSettings);
router.post("/force-crash-next", verifyAdmin, forceCrashNext);
router.post("/force-crash-now", verifyAdmin, forceCrashNow);
router.get("/stats", verifyAdmin, getStats);

// Protected Admin Aliases
router.get("/admin/settings", verifyAdmin, getSettings);
router.post("/admin/settings", verifyAdmin, updateSettings);
router.post("/admin/force-crash-next", verifyAdmin, forceCrashNext);
router.post("/admin/force-crash-now", verifyAdmin, forceCrashNow);
router.get("/admin/stats", verifyAdmin, getStats);

export default router;
