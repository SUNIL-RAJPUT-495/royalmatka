import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

/**
 * Check current notification permission status
 */
export const checkNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const status = await PushNotifications.checkPermissions();
      return status.receive; // 'granted' | 'denied' | 'prompt'
    } else if ('Notification' in window) {
      return Notification.permission; // 'granted' | 'denied' | 'default'
    }
  } catch (e) {
    console.warn("Error checking notification permission:", e);
  }
  return 'default';
};

/**
 * Request notification permission from OS / Browser
 */
export const requestAppNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Android / iOS Push & Local Notification Permissions
      let pushRes = await PushNotifications.requestPermissions();
      let localRes = await LocalNotifications.requestPermissions();

      if (pushRes.receive === 'granted' || localRes.display === 'granted') {
        toast.success("Notification Permission Allowed! 🔔");
        return 'granted';
      } else {
        toast.error("Notification Permission Denied by User.");
        return 'denied';
      }
    } else if ('Notification' in window) {
      // Browser / Web Notifications
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        toast.success("Notification Permission Allowed! 🔔");
      } else if (perm === 'denied') {
        toast.error("Notification Permission Denied.");
      }
      return perm;
    } else {
      toast.error("Notifications not supported on this device/browser.");
      return 'unsupported';
    }
  } catch (e) {
    console.error("Error requesting notification permission:", e);
    toast.error("Could not request notification permission.");
    return 'error';
  }
};

/**
 * Trigger Native Status Bar Notification (Android / iOS / Browser)
 */
export const showLocalStatusNotification = async (title, body) => {
  try {
    if (Capacitor.isNativePlatform()) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: String(title),
            body: String(body),
            id: Math.floor(Math.random() * 100000) + 1,
            schedule: { at: new Date(Date.now() + 100) }
          }
        ]
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: body });
    }
  } catch (e) {
    console.warn("Could not trigger status bar notification:", e);
  }
};
