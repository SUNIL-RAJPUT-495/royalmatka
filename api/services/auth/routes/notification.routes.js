import express from "express";
import {
  sendNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
} from "../controllers/notification.controller.js";

const router = express.Router();

// Notifications Management
router.post("/send", sendNotification);
router.get("/all", getAllNotifications);
router.get("/get-all-notifications", getAllNotifications);
router.put("/update/:id", updateNotification);
router.put("/update", updateNotification);
router.post("/update", updateNotification);
router.delete("/delete/:id", deleteNotification);
router.delete("/delete", deleteNotification);
router.post("/delete", deleteNotification);

// Notification Settings
router.get("/settings", getNotificationSettings);
router.post("/settings", updateNotificationSettings);
router.put("/settings", updateNotificationSettings);

export default router;
