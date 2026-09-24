/**
 * frontend/lib/pushNotifications.ts
 * Web Push and Service Worker registration utilities with auto-recovery and diagnostics.
 */

export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    // Wait until the service worker is active
    if (registration.installing) {
      await new Promise<void>((resolve) => {
        registration.installing?.addEventListener("statechange", function onStateChange() {
          if (this.state === "activated") {
            this.removeEventListener("statechange", onStateChange);
            resolve();
          }
        });
        setTimeout(resolve, 1500);
      });
    }

    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error("Failed to register Service Worker for Web Push:", error);
    return null;
  }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("Could not check existing push subscription:", err);
    return null;
  }
}

export async function subscribeToPush(
  vapidPublicKey: string
): Promise<{ endpoint: string; keys: { p256dh: string; auth: string }; user_agent: string } | null> {
  if (!isPushSupported()) {
    throw new Error("Web Push is not supported in this browser");
  }

  // 1. Ensure permission is requested & granted
  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }
  if (permission !== "granted") {
    throw new Error(`Notification permission was not granted (${permission})`);
  }

  // 2. Ensure Service Worker is registered & ready
  const registration = await registerServiceWorker();
  if (!registration) {
    throw new Error("Service Worker registration failed");
  }

  const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

  // 3. Inspect existing subscription if any
  let subscription: PushSubscription | null = null;
  try {
    subscription = await registration.pushManager.getSubscription();
  } catch (e) {
    console.warn("Could not check current subscription:", e);
  }

  // If a valid subscription already exists with full keys, reuse it
  if (subscription) {
    try {
      const rawJson = subscription.toJSON();
      if (rawJson.keys?.p256dh && rawJson.keys?.auth) {
        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: rawJson.keys.p256dh,
            auth: rawJson.keys.auth,
          },
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        };
      }
    } catch {
      // Incomplete subscription, reset
      try {
        await subscription.unsubscribe();
      } catch {}
      subscription = null;
    }
  }

  // 4. Subscribe via PushManager with automatic stale subscription recovery
  try {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey as unknown as BufferSource,
    });
  } catch (firstErr: any) {
    console.warn("Initial pushManager.subscribe failed, clearing stale subscription and retrying:", firstErr);

    try {
      // Purge any stale registration from pushManager
      const stale = await registration.pushManager.getSubscription();
      if (stale) {
        await stale.unsubscribe();
      }

      // Retry fresh subscription
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    } catch (retryErr: any) {
      const isBrave = typeof (navigator as any).brave?.isBrave === "function";
      const errName = retryErr?.name || firstErr?.name;
      const errMsg = retryErr?.message || firstErr?.message || "";

      if (errName === "AbortError" || errMsg.includes("push service error")) {
        let msg = "Browser push service error.";
        if (isBrave) {
          msg = "In Brave browser, please enable 'Use Google services for push messaging' in brave://settings/privacy.";
        } else {
          msg = "Push service connection failed. Please ensure notifications are enabled in your browser and not blocked by a privacy extension or firewall.";
        }
        console.warn(`[WebPush] Notice: ${msg}`);
        throw new Error(msg);
      }

      throw retryErr || firstErr;
    }
  }

  if (!subscription) {
    throw new Error("Unable to obtain push subscription from browser");
  }

  const rawJson = subscription.toJSON();
  const endpoint = subscription.endpoint;
  const p256dh = rawJson.keys?.p256dh;
  const auth = rawJson.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error("Push subscription returned incomplete keys");
  }

  return {
    endpoint,
    keys: {
      p256dh,
      auth,
    },
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  };
}

export async function unsubscribeFromPush(): Promise<string | null> {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      return endpoint;
    }
  } catch (err) {
    console.error("Error unsubscribing from push:", err);
  }
  return null;
}
