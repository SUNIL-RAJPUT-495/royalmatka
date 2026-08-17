import express from "express";
import {
  getAdminThreads,
  getAdminMessages,
  sendAdminMessage,
  getUserMessages,
  sendUserMessage,
  clearChat
} from "../controllers/chat.controller.js";

const router = express.Router();

// Admin chat endpoints
router.get("/admin/threads", getAdminThreads);
router.get("/admin/messages/:userId", getAdminMessages);
router.post("/admin/send", sendAdminMessage);
router.delete("/admin/clear/:userId", clearChat);

// User chat endpoints
router.get("/user/messages", getUserMessages);
router.get("/user/messages/:userId", getUserMessages);
router.post("/user/send", sendUserMessage);

export default router;
