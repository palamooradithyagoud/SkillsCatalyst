/**
 * SkillsCatalyst Web Push Service Worker
 * Handles background push message receipts, notification clicks, window focusing,
 * and deep navigation for Streaks, Events, and Scholarships.
 */

self.addEventListener("install", (event) => {
  // Activate immediately without waiting for existing worker clients to close
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim all active clients so the new service worker takes immediate control
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch (err) {
    data = {
      title: "SkillsCatalyst Notification",
      body: event.data.text() || "You have a new update.",
      url: "/dashboard",
      type: "general",
    };
  }

  const title = data.title || "SkillsCatalyst";
  const options = {
    body: data.body || "New update available on SkillsCatalyst.",
    icon: "/icon-192.png",
    badge: "/favicon-32x32.png",
    tag: data.notification_id || `skillscatalyst-${data.type || "alert"}-${Date.now()}`,
    data: {
      url: data.url || "/dashboard",
      type: data.type || "general",
      notification_id: data.notification_id || null,
      metadata: data.metadata || {},
    },
    vibrate: [100, 50, 100],
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If an existing SkillsCatalyst tab is open, focus it and navigate
        for (const client of windowClients) {
          if (client.url && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        // Otherwise open a new browser window/tab
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
