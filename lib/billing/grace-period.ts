import { IUser } from "@/models/User";
import { isInTrial } from "@/lib/utils";

export const BILLING_GRACE_PERIOD_DAYS = parseInt(
  process.env.BILLING_GRACE_PERIOD_DAYS || "30",
  10
);

export const PERMANENT_PRO_SUBSCRIPTION_TYPES = new Set([
  "manual_paid",
  "manual_pro_only",
]);

export const BILLING_GRACE_SUBSCRIPTION_TYPE = "billing_grace_period";

export function hasPermanentProGrant(
  user: Pick<IUser, "isPaid" | "subscriptionType"> | null | undefined
): boolean {
  if (!user?.isPaid && !user?.subscriptionType) return false;
  if (user.isPaid) return true;
  return PERMANENT_PRO_SUBSCRIPTION_TYPES.has(user.subscriptionType!);
}

export function getGracePeriodEndDate(from: Date = new Date()): Date {
  const end = new Date(from);
  end.setTime(
    end.getTime() + BILLING_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );
  return end;
}

export function buildGracePeriodUpdate(now: Date = new Date()) {
  return {
    plan: "pro" as const,
    isPaid: false,
    trialStart: now,
    trialEnd: getGracePeriodEndDate(now),
    subscriptionType: BILLING_GRACE_SUBSCRIPTION_TYPE,
  };
}

/**
 * One-time billing grace for legacy users who had Pro before payments launched.
 * Skips paid users, admin/manual grants, active trials, users who already
 * received billing grace, and users who were never on Pro/trial.
 */
export function shouldReceiveBillingGracePeriod(
  user: Pick<IUser, "isPaid" | "trialEnd" | "subscriptionType" | "plan">
): boolean {
  if (user.isPaid) return false;
  if (hasPermanentProGrant(user)) return false;
  if (user.subscriptionType === BILLING_GRACE_SUBSCRIPTION_TYPE) return false;
  if (isInTrial(user.trialEnd ?? null, false)) return false;

  const hadProOrTrial =
    user.plan === "pro" ||
    user.trialEnd != null ||
    user.subscriptionType === "trial_signup" ||
    user.subscriptionType === "mobile_signup";

  if (!hadProOrTrial) return false;

  return true;
}
