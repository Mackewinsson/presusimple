import { hasAnalyticsConsent } from "./consent";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

/** Keys that must never be sent to GA (financial PII and identifiers). */
const BLOCKED_PARAM_KEYS = new Set([
  "email",
  "user_id",
  "userid",
  "userId",
  "amount",
  "value",
  "currency",
  "category",
  "category_name",
  "description",
  "transaction_id",
  "name",
]);

export type GtagCommand = "config" | "consent" | "event" | "js" | "set";

export type GtagFn = (
  command: GtagCommand | string,
  targetOrAction: string | Date,
  params?: Record<string, unknown>
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFn;
  }
}

export function isAnalyticsConfigured(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function isAnalyticsEnabled(): boolean {
  return isAnalyticsConfigured() && hasAnalyticsConsent();
}

function getGtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  return window.gtag;
}

function sanitizeParams(
  params?: Record<string, unknown>
): Record<string, string> | undefined {
  if (!params) return undefined;

  const safe: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (BLOCKED_PARAM_KEYS.has(key)) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      safe[key] = String(value);
    }
  }

  return Object.keys(safe).length > 0 ? safe : undefined;
}

export function gtag(
  command: GtagCommand | string,
  targetOrAction: string | Date,
  params?: Record<string, unknown>
): void {
  const fn = getGtag();
  if (!fn) return;
  fn(command, targetOrAction, sanitizeParams(params));
}

export function updateConsentMode(granted: boolean): void {
  gtag("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function pageview(url: string): void {
  if (!isAnalyticsEnabled()) return;

  gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

export function event(
  action: string,
  params?: Record<string, string>
): void {
  if (!isAnalyticsEnabled()) return;

  gtag("event", action, params);
}
