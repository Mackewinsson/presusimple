export const CONSENT_STORAGE_KEY = "presusimple_cookie_consent";

export type ConsentStatus = "granted" | "denied";

export const CONSENT_MODE_DEFAULTS = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  wait_for_update: 500,
} as const;

export function getConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }

  return null;
}

export function setConsent(status: ConsentStatus): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONSENT_STORAGE_KEY, status);
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === "granted";
}
