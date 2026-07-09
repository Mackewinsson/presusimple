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
 * Waits for the registration's pending worker (installing or waiting) to reach
 * the "activated" state. On first visit after a deploy the install phase can
 * take a while because workbox precaches every build asset before activating.
 * Resolves null on timeout or if the worker becomes redundant (install failed).
 */
function waitForActiveWorker(
  registration: ServiceWorkerRegistration,
  timeoutMs: number
): Promise<ServiceWorker | null> {
  if (registration.active) return Promise.resolve(registration.active);

  const pending = registration.installing ?? registration.waiting;
  if (!pending) return Promise.resolve(null);

  return new Promise((resolve) => {
    const finish = (worker: ServiceWorker | null) => {
      clearTimeout(timer);
      pending.removeEventListener("statechange", onStateChange);
      resolve(worker);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    const onStateChange = () => {
      if (pending.state === "activated") finish(pending);
      else if (pending.state === "redundant") finish(null);
    };

    pending.addEventListener("statechange", onStateChange);
    // State may have changed between the sync check above and the listener
    onStateChange();
  });
}

/**
 * Returns a registration with an ACTIVE service worker, registering /sw.js
 * manually if next-pwa's auto-register script has not run yet, and waiting for
 * a freshly installed worker to activate. Returns null if no worker becomes
 * active (push subscription requires an active worker).
 */
export async function ensureServiceWorkerRegistered(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
    }

    const activeWorker = await waitForActiveWorker(
      registration,
      SERVICE_WORKER_ACTIVATION_TIMEOUT_MS
    );
    if (!activeWorker) {
      console.warn("[push] Service worker did not activate in time");
      return null;
    }

    // navigator.serviceWorker.ready resolves once a registration has an active
    // worker. This guarantees that registration.active is populated, which
    // callers (e.g. pushManager.subscribe) depend on.
    const readyRegistration = await navigator.serviceWorker.ready;
    return readyRegistration;
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
