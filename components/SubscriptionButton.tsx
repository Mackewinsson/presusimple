"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserSubscription } from "@/lib/hooks";
import { Clock, Crown } from "lucide-react";
import { calculateTrialDaysLeft, getSubscriptionStatus } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useCheckout } from "@/hooks/useCheckout";

const SubscriptionButton = () => {
  const { t } = useTranslation();
  const { data: subscription, isLoading } = useUserSubscription();
  const { checkout, loading, error, canCheckout } = useCheckout();
  const [showThankYou, setShowThankYou] = useState(false);

  const trialDaysLeft = calculateTrialDaysLeft(subscription?.trialEnd || null);
  const subscriptionStatus = getSubscriptionStatus(subscription || {});

  useEffect(() => {
    if (subscriptionStatus === "paid" && !showThankYou) {
      setShowThankYou(true);
      const timer = setTimeout(() => {
        setShowThankYou(false);
      }, 5000); // Show for 5 seconds
      return () => clearTimeout(timer);
    }
  }, [subscriptionStatus, showThankYou]);

  // AHORA LOS RETURNS CONDICIONALES
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // User is paid - show brief thank you message then hide
  if (subscriptionStatus === "paid") {
    if (showThankYou) {
      return (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <Crown className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {t('youHaveActiveSubscription')}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  // User is in trial - show trial banner
  if (subscriptionStatus === "trial") {
    return (
      <div className="space-y-3">
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {trialDaysLeft === 1
              ? `${t('yourFreeTrialEnds')} 1 ${t('days')}!`
              : `${t('yourFreeTrialEnds')} ${trialDaysLeft} ${t('days')}.`}
          </AlertDescription>
        </Alert>
        <Button
          onClick={checkout}
          disabled={loading || !canCheckout}
          className="w-full"
        >
          {loading ? t('redirecting') : t('upgradeNow')}
        </Button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
    );
  }

  // User has no subscription - don't show anything during onboarding
  // This prevents showing upgrade prompts for users without trial data
  return null;
};

export default SubscriptionButton;
