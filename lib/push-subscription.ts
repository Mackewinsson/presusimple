/**
 * Client-side helpers to keep the browser push subscription in sync with the
 * subscription stored in MongoDB.
 *
 * The server prunes stale subscriptions (410/404 from the push service), so a
 * user can end up with notification permission granted but no subscription in
 * the database. `resyncPushSubscription` repairs that silently on app open.
 */

const VAPID_KEY_ENDPOINT = "/api/notifications/vapid-public-key";
const SUBSCRIBE_ENDPOINT = "/api/notifications/subscribe";
const STATUS_ENDPOINT = "/api/notifications/subscription-status";
const SERVICE_WORKER_URL = "/sw.js";
const SERVICE_WORKER_ACTIVATION_TIMEOUT_MS = 30000;

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/**
 * Helper to wait until the service worker registration has an active worker.
 * Combines checking the current state, listening to statechange events,
 * listening to updatefound events, and a polling fallback to be 100% robust.
 */
async function waitForActive(
  registration: ServiceWorkerRegistration,
  timeoutMs: number
): Promise<boolean> {
  if (registration.active) return true;

  return new Promise<boolean>((resolve) => {
    const start = Date.now();
    let resolved = false;

    const done = (success: boolean) => {
      if (resolved) return;
      resolved = true;
      clearInterval(interval);
      registration.removeEventListener("updatefound", onUpdateFound);
      resolve(success);
    };

    // Check current state
    const checkState = () => {
      if (registration.active) {
        done(true);
        return true;
      }
      if (Date.now() - start > timeoutMs) {
        done(false);
        return true;
      }
      return false;
    };

    // Set up listeners for worker state changes
    const listenToWorker = (worker: ServiceWorker) => {
      const onStateChange = () => {
        if (worker.state === "activated") {
          worker.removeEventListener("statechange", onStateChange);
          done(true);
        } else if (worker.state === "redundant") {
          worker.removeEventListener("statechange", onStateChange);
          checkState();
        }
      };
      worker.addEventListener("statechange", onStateChange);
    };

    if (registration.installing) listenToWorker(registration.installing);
    if (registration.waiting) listenToWorker(registration.waiting);

    const onUpdateFound = () => {
      if (registration.installing) listenToWorker(registration.installing);
    };
    registration.addEventListener("updatefound", onUpdateFound);

    // Polling fallback to catch any missed events or edge cases
    const interval = setInterval(() => {
      checkState();
    }, 100);

    // Initial check
    checkState();
  });
}

/**
 * Returns a registration with an ACTIVE service worker, registering /sw.js
 * and waiting for the worker to activate. Returns null only on timeout or fatal error.
 */
export async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    // Always call register to ensure the latest service worker is registered/running
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
    
    // Wait for the worker to become active
    const active = await waitForActive(registration, SERVICE_WORKER_ACTIVATION_TIMEOUT_MS);
    if (!active) {
      console.warn("[push] Service worker did not activate in time");
      return null;
    }

    return registration;
  } catch (error) {
    console.error("[push] Failed to register service worker:", error);
    return null;
  }
}

async function saveSubscriptionToServer(
  subscription: PushSubscription
): Promise<boolean> {
  const response = await fetch(SUBSCRIBE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
  return response.ok;
}

async function createFreshSubscription(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  const response = await fetch(VAPID_KEY_ENDPOINT);
  if (!response.ok) return null;

  const vapidPublicKey = await response.text();

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });
}

export type ResyncResult =
  | "not-supported"
  | "no-permission"
  | "already-in-sync"
  | "resynced"
  | "failed";

/**
 * If notification permission is already granted, make sure the database has a
 * working push subscription for this browser:
 * - DB endpoint matches the browser subscription -> nothing to do.
 * - DB is missing or points to a different endpoint -> replace the browser
 *   subscription with a fresh one and save it to the server.
 */
export async function resyncPushSubscription(): Promise<ResyncResult> {
  if (!isPushSupported()) return "not-supported";
  if (Notification.permission !== "granted") return "no-permission";

  try {
    const registration = await ensureServiceWorkerRegistered();
    if (!registration) return "failed";
    const browserSubscription = await registration.pushManager.getSubscription();

    const statusResponse = await fetch(STATUS_ENDPOINT);
    if (!statusResponse.ok) return "failed";
    const status: { subscribed: boolean; endpoint: string | null } =
      await statusResponse.json();

    if (
      browserSubscription &&
      status.subscribed &&
      status.endpoint === browserSubscription.endpoint
    ) {
      return "already-in-sync";
    }

    // The DB record is missing or stale. The old browser subscription may be
    // expired too (the push service reported 410), so start from scratch.
    if (browserSubscription) {
      await browserSubscription.unsubscribe();
    }

    const freshSubscription = await createFreshSubscription(registration);
    if (!freshSubscription) return "failed";

    const saved = await saveSubscriptionToServer(freshSubscription);
    return saved ? "resynced" : "failed";
  } catch (error) {
    console.error("[push] Failed to resync push subscription:", error);
    return "failed";
  }
}
