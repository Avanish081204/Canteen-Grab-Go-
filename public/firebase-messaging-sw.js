// Firebase Cloud Messaging Service Worker for Web Push
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3ADlb9F6S7wqwJS3I_90EWDFjeDzIr5g",
  authDomain: "canteen-grab-go.firebaseapp.com",
  projectId: "canteen-grab-go",
  storageBucket: "canteen-grab-go.firebasestorage.app",
  messagingSenderId: "639622485470",
  appId: "1:639622485470:web:875806701308157fe6f94f",
  measurementId: "G-E0XZSHLB7G"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Campus Canteen 🔔';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'New update received',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

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
