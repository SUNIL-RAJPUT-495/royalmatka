import express from "express";
import {
  getAdminThreads,
  getAdminMessages,
  sendAdminMessage,
  getUserMessages,
  sendUserMessage,
  clearChat
} from "../controllers/chat.controller.js";
import { verifyAdmin, verifyToken } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Admin chat endpoints
router.get("/admin/threads", verifyAdmin, getAdminThreads);
router.get("/admin/messages/:userId", verifyAdmin, getAdminMessages);
router.post("/admin/send", verifyAdmin, sendAdminMessage);
router.delete("/admin/clear/:userId", verifyAdmin, clearChat);

// User chat endpoints
router.get("/user/messages", verifyToken, getUserMessages);
router.get("/user/messages/:userId", verifyToken, getUserMessages);
router.post("/user/send", verifyToken, sendUserMessage);

export default router;
