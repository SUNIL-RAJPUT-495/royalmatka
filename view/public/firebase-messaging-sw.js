// Firebase Messaging Service Worker for background push notifications
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAo8UCJ1rEYubk3qXNv9rl1ETBfvnPbDbs",
  authDomain: "sawariyaboss.firebaseapp.com",
  projectId: "sawariyaboss",
  storageBucket: "sawariyaboss.firebasestorage.app",
  messagingSenderId: "620003837238",
  appId: "1:620003837238:web:84964cc2146f6f2d9f5f97"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background notification payload: ', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'SanwariyaBoss Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || payload.data?.content || '',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || '/notifications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
