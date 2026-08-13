import express from "express";
import {
  getSettings,
  updateSettings,
  forceCrashNext,
  forceCrashNow,
  getStats,
} from "../controllers/aviator.controller.js";

const router = express.Router();

router.get("/admin/settings", getSettings);
router.post("/admin/settings", updateSettings);
router.post("/admin/force-crash-next", forceCrashNext);
router.post("/admin/force-crash-now", forceCrashNow);
router.get("/admin/stats", getStats);

export default router;
