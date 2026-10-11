/**
 * Client-side browser fingerprint generator
 * Generates a stable device/browser identifier without external dependencies.
 */

let cachedFingerprint: string | null = null;

export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "server-env";
  }

  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  try {
    const stored = sessionStorage.getItem("lucidchat_device_fp");
    if (stored) {
      cachedFingerprint = stored;
      return stored;
    }
  } catch {
    // sessionStorage might be restricted in private/incognito modes
  }

  try {
    const nav = window.navigator;
    const screen = window.screen;

    // Canvas fingerprint slice
    let canvasData = "";
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 40;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("LucidChat Security fp", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("LucidChat Security fp", 4, 17);
        canvasData = canvas.toDataURL().slice(-50);
      }
    } catch {
      canvasData = "canvas-blocked";
    }

    const components = [
      nav.userAgent || "",
      nav.language || "",
      screen.colorDepth || 0,
      screen.width || 0,
      screen.height || 0,
      new Date().getTimezoneOffset(),
      nav.hardwareConcurrency || 1,
      nav.maxTouchPoints || 0,
      canvasData,
    ].join("###");

    // Compute SHA-256 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(components);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);

    cachedFingerprint = hashHex;

    try {
      sessionStorage.setItem("lucidchat_device_fp", hashHex);
    } catch {
      // Ignore sessionStorage errors
    }

    return hashHex;
  } catch {
    // Fallback pseudo-random ID stored per session
    const fallbackFp = `fp_${Math.random().toString(36).slice(2, 18)}`;
    cachedFingerprint = fallbackFp;
    return fallbackFp;
  }
}
