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
