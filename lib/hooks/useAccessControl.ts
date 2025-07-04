import { useUserSubscription } from "./useUserId";
import { getSubscriptionStatus } from "@/lib/utils";

export interface AccessControl {
  canAccessBudget: boolean;
  canAccessExpenses: boolean;
  canAccessHistory: boolean;
  canAccessSettings: boolean;
  canCreateBudget: boolean;
  canAddExpenses: boolean;
  canEditCategories: boolean;
  canResetBudget: boolean;
  isTrialExpired: boolean;
  isPaid: boolean;
  isInTrial: boolean;
  hasNoSubscription: boolean;
}

export function useAccessControl(): AccessControl {
  const { data: subscription, isLoading } = useUserSubscription();

  if (isLoading || !subscription) {
    return {
      canAccessBudget: false,
      canAccessExpenses: false,
      canAccessHistory: false,
      canAccessSettings: false,
      canCreateBudget: false,
      canAddExpenses: false,
      canEditCategories: false,
      canResetBudget: false,
      isTrialExpired: false,
      isPaid: false,
      isInTrial: false,
      hasNoSubscription: true,
    };
  }

  const subscriptionStatus = getSubscriptionStatus(subscription);
  const isPaid = subscriptionStatus === "paid";
  const isInTrial = subscriptionStatus === "trial";
  const isTrialExpired = subscriptionStatus === "expired";
  const hasNoSubscription = subscriptionStatus === "none";

  // Access rules:
  // - Paid users: Full access to everything
  // - Trial users: Full access to everything
  // - Expired trial users: No access to any features
  // - No subscription users: No access to any features

  return {
    canAccessBudget: isPaid || isInTrial,
    canAccessExpenses: isPaid || isInTrial,
    canAccessHistory: isPaid || isInTrial,
    canAccessSettings: isPaid || isInTrial,
    canCreateBudget: isPaid || isInTrial,
    canAddExpenses: isPaid || isInTrial,
    canEditCategories: isPaid || isInTrial,
    canResetBudget: isPaid || isInTrial,
    isTrialExpired,
    isPaid,
    isInTrial,
    hasNoSubscription,
  };
}
