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

// Protected Admin Aviator Endpoints
router.get("/admin/settings", verifyAdmin, getSettings);
router.post("/admin/settings", verifyAdmin, updateSettings);
router.post("/admin/force-crash-next", verifyAdmin, forceCrashNext);
router.post("/admin/force-crash-now", verifyAdmin, forceCrashNow);
router.get("/admin/stats", verifyAdmin, getStats);

export default router;
