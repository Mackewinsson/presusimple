import { cookies } from "next/headers";
import {
  REFERRAL_COOKIE_NAME,
  normalizeReferralCode,
} from "@/lib/referrals/constants";

export async function readPendingReferralCode(): Promise<string | null> {
  try {
    const store = await cookies();
    return normalizeReferralCode(store.get(REFERRAL_COOKIE_NAME)?.value);
  } catch (error) {
    console.error("[referrals] Failed to read pending referral cookie:", error);
    return null;
  }
}

export async function clearPendingReferralCookie(): Promise<void> {
  try {
    const store = await cookies();
    store.delete(REFERRAL_COOKIE_NAME);
  } catch (error) {
    console.error("[referrals] Failed to clear pending referral cookie:", error);
  }
}
