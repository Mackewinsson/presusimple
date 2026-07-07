import { event } from "./gtag";

export const ANALYTICS_EVENTS = {
  SIGN_UP: "sign_up",
  BEGIN_CHECKOUT: "begin_checkout",
} as const;

export type SignUpMethod = "google" | "credentials";

export function trackSignUp(method: SignUpMethod): void {
  event(ANALYTICS_EVENTS.SIGN_UP, { method });
}

export function trackBeginCheckout(locale: "en" | "es"): void {
  event(ANALYTICS_EVENTS.BEGIN_CHECKOUT, { locale });
}
