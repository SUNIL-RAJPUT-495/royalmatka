import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export const requestForToken = async () => {
  try {
    if (!messaging || typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      let registration = null;
      try {
        registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      } catch (e) {
        console.warn("Could not register firebase-messaging-sw.js:", e);
      }

      const tokenOptions = {};
      if (registration) tokenOptions.serviceWorkerRegistration = registration;
      if (import.meta.env.VITE_FIREBASE_VAPID_KEY) {
        tokenOptions.vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      }

      const currentToken = await getToken(messaging, tokenOptions);
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (err) {
    console.warn("An error occurred while retrieving token: ", err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      console.log("Foreground Message received: ", payload);
      resolve(payload);
    });
  });

export { app, messaging };
