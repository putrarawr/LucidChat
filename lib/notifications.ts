"use client";

/**
 * Native Browser & Mobile Device Push Notification Helper
 * Supports ServiceWorker push notifications (Android Chrome / iOS PWA)
 * and standard Web Notification API (Desktop Browser).
 */

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    return reg;
  } catch (err) {
    console.warn("ServiceWorker registration error:", err);
    return null;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  // Register service worker in background
  registerServiceWorker();

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
  icon = "/logo.png"
): Promise<void> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  // Convert icon path to absolute URL so OS notification daemons (Firefox/Android/iOS) fetch the logo
  const targetIcon = icon === "/icon.png" ? "/logo.png" : icon || "/logo.png";
  const absoluteIcon = typeof window !== "undefined"
    ? new URL(targetIcon, window.location.origin).href
    : targetIcon;

  const cleanBody = body ? body.replace(/[*_#`~]/g, "").trim() : "";
  const displayBody = cleanBody.length > 120 ? cleanBody.slice(0, 120) + "..." : cleanBody;

  try {
    // 1. Try Service Worker Notification if active (best for mobile devices when tab is backgrounded/minimized)
    if ("serviceWorker" in navigator) {
      try {
        // Register if not already registered
        await registerServiceWorker();

        // Timeout promise to prevent hanging if sw.ready is slow
        const swReadyPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

        const registration = (await Promise.race([swReadyPromise, timeoutPromise])) as ServiceWorkerRegistration | null;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body: displayBody,
            icon: absoluteIcon,
            badge: absoluteIcon,
            tag: `lucidchat-${Date.now()}`,
          });
          return;
        }
      } catch (swErr) {
        console.warn("ServiceWorker notification failed, using Web Notification fallback:", swErr);
      }
    }

    // 2. Standard Web Notification API fallback (Desktop browsers & foreground tabs)
    const notif = new Notification(title, {
      body: displayBody,
      icon: absoluteIcon,
      badge: absoluteIcon,
      tag: `lucidchat-${Date.now()}`,
    });

    notif.onclick = () => {
      window.focus();
    };
  } catch (err) {
    console.warn("Failed to dispatch push notification:", err);
  }
};

