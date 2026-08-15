import express from "express";
import { getSystemSettings, updateSystemSettings, getBonusStats } from "../controllers/settings.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-settings", getSystemSettings);
router.post("/update-settings", verifyAdmin, updateSystemSettings);
router.put("/update-settings", verifyAdmin, updateSystemSettings);
router.get("/bonus-stats", getBonusStats);

export default router;
