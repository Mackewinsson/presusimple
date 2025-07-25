import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}



export function calculateTrialDaysLeft(trialEnd: Date | string | null): number {
  if (!trialEnd) return 0;
  const now = new Date();
  const trialEndDate = new Date(trialEnd);
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function isTrialExpired(
  trialEnd: Date | string | null,
  isPaid: boolean
): boolean {
  if (!trialEnd || isPaid) return false;
  return calculateTrialDaysLeft(trialEnd) <= 0;
}

export function isInTrial(
  trialEnd: Date | string | null,
  isPaid: boolean
): boolean {
  if (!trialEnd || isPaid) return false;
  return calculateTrialDaysLeft(trialEnd) > 0;
}

export function getSubscriptionStatus(subscription: {
  isPaid?: boolean;
  trialStart?: Date | string | null;
  trialEnd?: Date | string | null;
}) {
  const { isPaid = false, trialEnd } = subscription;

  if (isPaid) return "paid";
  if (isTrialExpired(trialEnd || null, isPaid)) return "expired";
  if (isInTrial(trialEnd || null, isPaid)) return "trial";
  return "none";
}
