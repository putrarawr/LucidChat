"use client";

/**
 * Native Browser & Mobile Device Push Notification Helper
 * Supports ServiceWorker push notifications (Android Chrome / iOS PWA)
 * and standard Web Notification API (Desktop Browser).
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "default") {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (err) {
      console.warn("Error requesting notification permission:", err);
      return false;
    }
  }

  return false;
};

export const sendNativePushNotification = async (
  title: string,
  body: string,
  icon = "/icon.png"
): Promise<void> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  // Convert icon path to absolute URL so OS notification daemons (Firefox/Android/iOS) fetch the logo
  const absoluteIcon = typeof window !== "undefined"
    ? new URL(icon || "/logo.png", window.location.origin).href
    : icon || "/logo.png";

  try {
    // 1. Try Service Worker Notification if registered (best for mobile devices)
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: body.length > 120 ? body.slice(0, 120) + "..." : body,
            icon: absoluteIcon,
            badge: absoluteIcon,
            tag: "lucidchat-notification",
          });
          return;
        }
      } catch (swErr) {
        console.warn("ServiceWorker notification failed, using Web Notification fallback:", swErr);
      }
    }

    // 2. Standard Web Notification API fallback (Desktop browsers)
    const notif = new Notification(title, {
      body: body.length > 120 ? body.slice(0, 120) + "..." : body,
      icon: absoluteIcon,
      badge: absoluteIcon,
      tag: "lucidchat-notification",
    });

    notif.onclick = () => {
      window.focus();
    };
  } catch (err) {
    console.warn("Failed to dispatch push notification:", err);
  }
};
