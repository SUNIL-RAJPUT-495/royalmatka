import express from "express";
import {
  sendNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
} from "../controllers/notification.controller.js";
import { saveFcmToken } from "../controllers/auth.controller.js";
import { verifyAdmin, verifyToken } from "../../../middleware/auth.middleware.js";

const router = express.Router();

// Notifications Management
router.post("/send", verifyAdmin, sendNotification);
router.get("/all", getAllNotifications);
router.get("/get-all-notifications", getAllNotifications);
router.post("/save-fcm-token", verifyToken, saveFcmToken);
router.put("/update/:id", verifyAdmin, updateNotification);
router.post("/update/:id", verifyAdmin, updateNotification);
router.put("/update", verifyAdmin, updateNotification);
router.post("/update", verifyAdmin, updateNotification);
router.delete("/delete/:id", verifyAdmin, deleteNotification);
router.post("/delete/:id", verifyAdmin, deleteNotification);
router.delete("/delete", verifyAdmin, deleteNotification);
router.post("/delete", verifyAdmin, deleteNotification);

// Notification Settings
router.get("/settings", getNotificationSettings);
router.post("/settings", verifyAdmin, updateNotificationSettings);
router.put("/settings", verifyAdmin, updateNotificationSettings);

export default router;
