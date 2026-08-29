import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBbytr2X-Pf4GbZ6-ANr23z5d3ecxisIsc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "matka-8dff8.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "matka-8dff8",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "matka-8dff8.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "202654754463",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:202654754463:web:84964cc2146f6f2d9f5f97",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);
const messaging = typeof window !== "undefined" ? getMessaging(app) : null;

export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported && firebaseConfig.measurementId) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Analytics init warning:", e);
      }
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
