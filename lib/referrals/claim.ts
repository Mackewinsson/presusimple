import { attributeSignupReferral } from "@/lib/referrals/attribute";
import {
  clearPendingReferralCookie,
  readPendingReferralCode,
} from "@/lib/referrals/pending-cookie";

/**
 * Apply the referral cookie captured from `?ref=` to a brand-new account.
 * Signup still succeeds when the code is missing, unknown, or the update fails.
 */
export async function claimReferralForNewUser(
  newUserEmail: string | null | undefined
): Promise<string | undefined> {
  const pending = await readPendingReferralCode();
  if (!pending) return undefined;

  try {
    const code = await attributeSignupReferral({
      referralCode: pending,
      newUserEmail,
    });
    if (code) {
      console.info("[referrals] Attributed signup", { code });
    }
    return code ?? undefined;
  } catch (error) {
    console.error("[referrals] Attribution failed:", error);
    return undefined;
  }
}

export async function clearReferralAfterAuth(): Promise<void> {
  await clearPendingReferralCookie();
}
