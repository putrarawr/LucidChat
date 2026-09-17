// Service Worker for LucidChat Push Notifications
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle Notification Click on Android / Mobile / Desktop
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if open
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      // Open new window/tab if closed
      if (self.clients.openWindow) {
        return self.clients.openWindow("/chat");
      }
    })
  );
});
