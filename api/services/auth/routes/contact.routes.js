import express from "express";
import { getContactSettings, updateContactSettings } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/get-settings", getContactSettings);
router.post("/update-settings", updateContactSettings);

export default router;
