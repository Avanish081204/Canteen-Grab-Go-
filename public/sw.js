// Campus Canteen Service Worker v1.0
const CACHE_NAME = 'campus-canteen-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: pre-cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first strategy (fall back to cache)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Don't intercept Supabase/API calls
  const url = new URL(event.request.url);
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a clone of successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Background Web Push Notification
self.addEventListener('push', (event) => {
  let data = { title: 'Campus Canteen', body: 'New notification from Campus Canteen' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body || data.message || '',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: data,
    tag: data.orderToken || 'canteen-update',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Campus Canteen', options)
  );
});

// When user clicks the desktop/mobile notification banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  let targetUrl = '/';
  if (data.orderToken) {
    targetUrl = `/track?token=${encodeURIComponent(data.orderToken)}`;
  } else if (data.type === 'new_order') {
    targetUrl = '/staff/dashboard';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

