import { FEATURES, FeatureKey } from "./features";
import { IUser } from "@/models/User";
import { isInTrial } from "@/lib/utils";

export type UserTier = "free" | "pro";

/**
 * Single source of truth for whether a user should receive Pro-tier access.
 * Combines paid status, active trial, and plan — expired trials downgrade to free
 * even when plan is still "pro" in the database.
 */
export function getEffectiveUserTier(
  user: IUser | null | undefined
): UserTier {
  if (!user) return "free";

  if (user.isPaid) return "pro";

  const isPaid = user.isPaid ?? false;
  if (isInTrial(user.trialEnd ?? null, isPaid)) return "pro";

  // Admin/manual Pro without trial dates
  if (user.plan === "pro" && !user.trialEnd) return "pro";

  return "free";
}

export function hasEffectiveProAccess(
  user: IUser | null | undefined
): boolean {
  return getEffectiveUserTier(user) === "pro";
}

export function hasAccess(user: IUser | null | undefined, featureKey: FeatureKey): boolean {
  if (!user) return false;

  const feature = FEATURES[featureKey];
  const userPlan = getEffectiveUserTier(user);

  return (feature.plans as readonly string[]).includes(userPlan);
}

export function getUserPlan(user: IUser | null | undefined): UserTier {
  return getEffectiveUserTier(user);
}

export function getAvailableFeatures(user: IUser | null | undefined): FeatureKey[] {
  if (!user) return [];
  
  const userPlan = getUserPlan(user);
  return Object.entries(FEATURES)
    .filter(([_, feature]) => (feature.plans as readonly string[]).includes(userPlan))
    .map(([key, _]) => key as FeatureKey);
}

export function getProFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, feature]) => feature.plans.includes("pro" as any) && !feature.plans.includes("free" as any))
    .map(([key, _]) => key as FeatureKey);
} 