import { FEATURES, FeatureKey } from "./features";
import { IUser } from "@/models/User";

export function hasAccess(user: IUser | null | undefined, featureKey: FeatureKey): boolean {
  if (!user) return false;
  
  const feature = FEATURES[featureKey];
  const userPlan = user.plan || "free";
  
  return feature.plans.includes(userPlan as any);
}

export function getUserPlan(user: IUser | null | undefined): "free" | "pro" {
  return user?.plan || "free";
}

export function getAvailableFeatures(user: IUser | null | undefined): FeatureKey[] {
  if (!user) return [];
  
  const userPlan = getUserPlan(user);
  return Object.entries(FEATURES)
    .filter(([_, feature]) => feature.plans.includes(userPlan as any))
    .map(([key, _]) => key as FeatureKey);
}

export function getProFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, feature]) => feature.plans.includes("pro" as any) && !feature.plans.includes("free" as any))
    .map(([key, _]) => key as FeatureKey);
} 