import { useSession } from "next-auth/react";
import { hasAccess, getUserPlan, getAvailableFeatures, getProFeatures } from "@/lib/userAccess";
import { FeatureKey } from "@/lib/features";
import { IUser } from "@/models/User";

export function useFeatureFlags() {
  const { data: session } = useSession();
  const user = session?.user as IUser | undefined;

  const hasFeatureAccess = (featureKey: FeatureKey): boolean => {
    return hasAccess(user, featureKey);
  };

  const getCurrentPlan = (): "free" | "pro" => {
    return getUserPlan(user);
  };

  const getAvailableFeaturesForUser = (): FeatureKey[] => {
    return getAvailableFeatures(user);
  };

  const getProOnlyFeatures = (): FeatureKey[] => {
    return getProFeatures();
  };

  return {
    hasFeatureAccess,
    getCurrentPlan,
    getAvailableFeaturesForUser,
    getProOnlyFeatures,
    user,
  };
} 