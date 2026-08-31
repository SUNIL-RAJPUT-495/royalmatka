// Service Worker for SanwariyaBoss PWA & PWABuilder compatibility
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch requests to network safely
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return new Response('Network error', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// Handle push notifications when website is backgrounded or closed
self.addEventListener('push', (event) => {
  let data = { title: 'SanwariyaBoss Alert', body: 'You have a new message' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SanwariyaBoss Alert', body: event.data.text() };
    }
  }

  const title = data.title || data.notification?.title || 'SanwariyaBoss Alert';
  const options = {
    body: data.body || data.content || data.notification?.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/notifications'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle clicking on notification in notification bar
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

