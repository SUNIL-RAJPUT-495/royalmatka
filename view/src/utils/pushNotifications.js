import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import Axios from './axios';
import SummaryApi from '../common/SummerAPI';
import { showLocalStatusNotification } from './notificationPermission';

/**
 * Initialize Push Notifications on Capacitor Android / iOS / Web
 */
export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn("Web notification permission request error:", e);
      }
    }
    console.log("Push notifications initialized (Web mode)");
    return;
  }

  try {
    // Create Android High Importance Notification Channel
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Default Notifications',
        description: 'Game Result and Account Alerts',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#FF0000'
      }).catch(() => {});
    }

    // 1. Check & Request Permissions (Push + Local Notifications)
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt' || permStatus.receive === 'default') {
      permStatus = await PushNotifications.requestPermissions();
    }

    let localPerm = await LocalNotifications.checkPermissions();
    if (localPerm.display === 'prompt' || localPerm.display === 'default') {
      localPerm = await LocalNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted' && localPerm.display !== 'granted') {
      console.warn("Notification permissions not granted");
      return;
    }

    // 2. Register with FCM / APNS
    await PushNotifications.register();

    // 3. Listen for FCM Device Token Registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM Token received:', token.value);
      if (token && token.value) {
        localStorage.setItem('fcm_token', token.value);
        
        // Save FCM token to backend DB for current user
        const localUserStr = localStorage.getItem("user_data");
        let localUser = null;
        try { if (localUserStr) localUser = JSON.parse(localUserStr); } catch (e) {}
        
        const userId = localUser?._id || localUser?.id || '';
        const mobile = localUser?.mobile || '';

        try {
          await Axios({
            url: SummaryApi.saveFcmToken.url,
            method: SummaryApi.saveFcmToken.method,
            data: { userId, mobile, fcmToken: token.value }
          });
        } catch (err) {
          console.warn("Could not save FCM token to backend:", err);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.warn('Error on registration: ', error);
    });

    // 4. Foreground Push Notification Listener (Shows Top Status Bar Alert)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      showLocalStatusNotification(
        notification.title || 'SanwariyaBoss Alert',
        notification.body || notification.data?.message || ''
      );
    });

    // 5. Push Notification Action Clicked Listener
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', notification);
      window.location.href = '/notifications';
    });

  } catch (e) {
    console.warn("Push notifications init error:", e);
  }
};
