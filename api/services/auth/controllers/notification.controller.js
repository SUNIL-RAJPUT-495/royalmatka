import Notification from "../models/Notification.js";
import NotificationSettings from "../models/NotificationSettings.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Initialize Firebase Admin SDK if service account json file exists
let messagingAdmin = null;
try {
  let targetFile = path.resolve(process.cwd(), "serviceAccountKey.json");
  if (!fs.existsSync(targetFile)) {
    const files = fs.readdirSync(process.cwd());
    const found = files.find(f => f.includes("firebase-adminsdk") && f.endsWith(".json"));
    if (found) targetFile = path.resolve(process.cwd(), found);
  }

  if (fs.existsSync(targetFile)) {
    const serviceAccount = JSON.parse(fs.readFileSync(targetFile, "utf8"));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    messagingAdmin = admin.messaging();
    console.log(`Firebase Admin SDK initialized successfully with ${path.basename(targetFile)}`);
  }
} catch (e) {
  console.warn("Firebase Admin SDK init warning:", e.message);
}

/**
 * Helper to dispatch FCM Push Notifications to device tokens
 */
const sendFcmPushNotification = async (tokens, notificationPayload) => {
  if (!tokens || tokens.length === 0) return;

  // 1. Try Firebase Admin SDK (FCM V1 API - Recommended)
  if (messagingAdmin) {
    try {
      const message = {
        notification: {
          title: notificationPayload.title,
          body: notificationPayload.content
        },
        data: {
          title: notificationPayload.title,
          body: notificationPayload.content,
          url: "/notifications"
        },
        tokens: tokens
      };

      const response = await messagingAdmin.sendEachForMulticast(message);
      console.log(`FCM V1 Push Response: ${response.successCount} sent, ${response.failureCount} failed`);
      return;
    } catch (err) {
      console.error("Error sending FCM V1 via Firebase Admin:", err);
    }
  }

  // 2. Fallback to FCM Legacy Server Key
  const serverKey = process.env.FCM_SERVER_KEY || process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    console.warn("FCM Push Warning: Neither serviceAccountKey.json nor FCM_SERVER_KEY is configured.");
    return;
  }

  try {
    const payload = {
      registration_ids: tokens,
      notification: {
        title: notificationPayload.title,
        body: notificationPayload.content,
        icon: "/logo192.png",
        click_action: "/notifications"
      },
      data: {
        title: notificationPayload.title,
        body: notificationPayload.content,
        url: "/notifications"
      },
      priority: "high"
    };

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `key=${serverKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("FCM Push Dispatch Result:", result);
  } catch (err) {
    console.error("Error sending FCM Push Notification:", err);
  }
};

// In-memory fallback if DB disconnected
let memoryNotifications = [
  {
    _id: "1",
    title: "MADHUR DAY",
    content: "499-27-124",
    isGlobal: true,
    reads: 0,
    createdAt: new Date()
  },
  {
    _id: "2",
    title: "TIME BAZAR",
    content: "688-27-278",
    isGlobal: true,
    reads: 0,
    createdAt: new Date(Date.now() - 3600000)
  }
];

let memorySettings = {
  userId: "admin",
  all: true,
  general: true,
  chat: true,
  calls: true,
  broadcasts: true,
  resultDeclared: true,
  mainGame: false,
  starline: false,
  jackpot: false,
  jackpotGali: false,
  winLoss: true,
  deposit: true,
  withdrawal: true,
  funds: true
};

/**
 * Send / Create Notification
 */
export const sendNotification = async (req, res) => {
  try {
    const { title, content, isGlobal, targetUser } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    if (mongoose.connection.readyState === 1) {
      const newNotif = await Notification.create({
        title: title.trim().toUpperCase(),
        content: content.trim(),
        isGlobal: isGlobal !== undefined ? isGlobal : true,
        targetUser: targetUser || null
      });

      // Collect target tokens & dispatch FCM Push Notification
      try {
        let recipientTokens = [];
        if (isGlobal || !targetUser) {
          const usersWithTokens = await User.find({ fcmToken: { $exists: true, $ne: "" } }).select("fcmToken");
          recipientTokens = usersWithTokens.map(u => u.fcmToken).filter(Boolean);
        } else {
          const queryUser = targetUser.trim();
          const singleUser = await User.findOne({
            $or: [
              ...(mongoose.Types.ObjectId.isValid(queryUser) ? [{ _id: queryUser }] : []),
              { mobile: queryUser },
              { username: queryUser }
            ]
          }).select("fcmToken");

          if (singleUser?.fcmToken) {
            recipientTokens.push(singleUser.fcmToken);
          }
        }

        if (recipientTokens.length > 0) {
          sendFcmPushNotification(recipientTokens, {
            title: title.trim().toUpperCase(),
            content: content.trim()
          });
        }
      } catch (pushErr) {
        console.error("Error dispatching push notifications:", pushErr);
      }

      return res.status(200).json({
        success: true,
        message: "Notification sent successfully! 🔔",
        notification: newNotif
      });
    }

    // Memory fallback
    const mockNotif = {
      _id: Date.now().toString(),
      title: title.trim().toUpperCase(),
      content: content.trim(),
      isGlobal: isGlobal !== undefined ? isGlobal : true,
      reads: 0,
      createdAt: new Date()
    };
    memoryNotifications.unshift(mockNotif);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully!",
      notification: mockNotif
    });
  } catch (error) {
    console.error("sendNotification Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get All Notifications
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { userId, mobile, user } = req.query;
    const targets = [userId, mobile, user]
      .filter(Boolean)
      .map(t => String(t).trim())
      .filter(t => t.length > 0);

    if (mongoose.connection.readyState === 1) {
      let query = { isGlobal: true };
      if (targets.length > 0) {
        query = {
          $or: [
            { isGlobal: true },
            { targetUser: { $in: targets } }
          ]
        };
      }

      const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(100);
      return res.status(200).json({
        success: true,
        notifications
      });
    }

    const memoryFiltered = memoryNotifications.filter(n => n.isGlobal || (targets.length > 0 && targets.includes(n.targetUser)));
    return res.status(200).json({
      success: true,
      notifications: memoryFiltered
    });
  } catch (error) {
    console.error("getAllNotifications Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Notification
 */
export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notifId = id || req.body.id || req.body._id;
    const { title, content, isGlobal } = req.body;

    if (!notifId) {
      return res.status(400).json({ success: false, message: "Notification ID is required." });
    }

    if (mongoose.connection.readyState === 1) {
      const notifObj = await Notification.findById(notifId);
      if (!notifObj) {
        return res.status(404).json({ success: false, message: "Notification not found." });
      }

      if (title) notifObj.title = title.trim().toUpperCase();
      if (content) notifObj.content = content.trim();
      if (isGlobal !== undefined) notifObj.isGlobal = isGlobal;

      await notifObj.save();

      return res.status(200).json({
        success: true,
        message: "Notification updated successfully! ✏️",
        notification: notifObj
      });
    }

    // Memory fallback
    memoryNotifications = memoryNotifications.map(n => {
      if (n._id === notifId) {
        return {
          ...n,
          title: title ? title.trim().toUpperCase() : n.title,
          content: content ? content.trim() : n.content,
          isGlobal: isGlobal !== undefined ? isGlobal : n.isGlobal
        };
      }
      return n;
    });

    return res.status(200).json({ success: true, message: "Notification updated successfully!" });
  } catch (error) {
    console.error("updateNotification Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notifId = id || req.query.id || req.body.id;

    if (!notifId) {
      return res.status(400).json({ success: false, message: "Notification ID is required." });
    }

    if (mongoose.connection.readyState === 1) {
      await Notification.findByIdAndDelete(notifId);
      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully! 🗑️"
      });
    }

    memoryNotifications = memoryNotifications.filter(n => n._id !== notifId);
    return res.status(200).json({ success: true, message: "Notification deleted successfully!" });
  } catch (error) {
    console.error("deleteNotification Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Notification Settings
 */
export const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.query.userId || "admin";

    if (mongoose.connection.readyState === 1) {
      let settings = await NotificationSettings.findOne({ userId });
      if (!settings) {
        settings = await NotificationSettings.create({ userId });
      }
      return res.status(200).json({
        success: true,
        settings
      });
    }

    return res.status(200).json({
      success: true,
      settings: memorySettings
    });
  } catch (error) {
    console.error("getNotificationSettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Notification Settings
 */
export const updateNotificationSettings = async (req, res) => {
  try {
    const { settings, userId } = req.body;
    const targetUserId = userId || "admin";
    const settingsData = settings || req.body;

    if (mongoose.connection.readyState === 1) {
      let existing = await NotificationSettings.findOne({ userId: targetUserId });
      if (!existing) {
        existing = new NotificationSettings({ userId: targetUserId, ...settingsData });
      } else {
        Object.assign(existing, settingsData);
      }
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Notification settings saved successfully! 🔔",
        settings: existing
      });
    }

    memorySettings = { ...memorySettings, ...settingsData };
    return res.status(200).json({
      success: true,
      message: "Notification settings saved successfully!",
      settings: memorySettings
    });
  } catch (error) {
    console.error("updateNotificationSettings Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
