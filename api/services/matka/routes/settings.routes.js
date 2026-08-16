import express from "express";
import { getSystemSettings, updateSystemSettings, getBonusStats } from "../controllers/settings.controller.js";
import { getHowToPlaySettings, updateHowToPlaySettings } from "../../auth/controllers/howToPlay.controller.js";
import { getReferralStats } from "../../auth/controllers/referral.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-settings", getSystemSettings);
router.post("/update-settings", verifyAdmin, updateSystemSettings);
router.put("/update-settings", verifyAdmin, updateSystemSettings);
router.get("/bonus-stats", getBonusStats);

// How To Play Endpoints
router.get("/how-to-play", getHowToPlaySettings);
router.post("/how-to-play", updateHowToPlaySettings);

// Referral Stats Endpoint
router.get("/get-referral-stats", getReferralStats);

export default router;
