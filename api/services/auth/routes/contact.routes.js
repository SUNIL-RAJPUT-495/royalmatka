import express from "express";
import { getContactSettings, updateContactSettings } from "../controllers/contact.controller.js";
import { verifyAdmin } from "../../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/get-settings", getContactSettings);
router.post("/update-settings", verifyAdmin, updateContactSettings);

export default router;
