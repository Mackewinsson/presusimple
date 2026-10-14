import User from "@/models/User";
import {
  REFERRAL_BONUS_DAYS,
  nextTrialEnd,
  normalizeReferralCode,
} from "@/lib/referrals/constants";

export interface AttributeSignupReferralInput {
  referralCode: string | null | undefined;
  newUserEmail: string | null | undefined;
  now?: Date;
}

/**
 * Record that `newUserEmail` joined via `referralCode` and extend the
 * referrer's trial by 30 days. Does not change plan, isPaid, or
 * subscriptionType — Pro access comes from the extended trialEnd.
 * Returns the normalized code when the referral is stored, otherwise null.
 */
export async function attributeSignupReferral(
  input: AttributeSignupReferralInput
): Promise<string | null> {
  const code = normalizeReferralCode(input.referralCode);
  const email = input.newUserEmail?.trim().toLowerCase();
  if (!code || !email) return null;

  const referrer = await User.findOne({ referralCode: code });
  if (!referrer) return null;

  const referrerEmail =
    typeof referrer.email === "string" ? referrer.email.trim().toLowerCase() : "";
  if (referrerEmail === email) return null;

  const now = input.now ?? new Date();
  const trialEnd = nextTrialEnd(referrer.trialEnd, now, REFERRAL_BONUS_DAYS);
  const result = await User.updateOne(
    { _id: referrer._id },
    { $set: { trialEnd } }
  );

  if ((result.matchedCount ?? 0) === 0) return null;
  return code;
}
