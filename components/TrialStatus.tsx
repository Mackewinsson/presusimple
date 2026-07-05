"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { useUserData } from "@/lib/hooks/useUserData";
import { calculateTrialDaysLeft } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import { useCheckout } from "@/hooks/useCheckout";

export function TrialStatus() {
  const { t } = useTranslation();
  const { data: user, isLoading } = useUserData();
  const { checkout, loading, error } = useCheckout();

  // Don't render anything while loading to prevent flashing
  if (isLoading) {
    return null;
  }

  // ✅ Add explicit check for paid users - don't show trial status for paid users
  if (user?.isPaid) {
    return null;
  }

  // Don't show for new users who just completed onboarding
  const onboardingComplete = typeof window !== 'undefined' ? localStorage.getItem("onboardingComplete") : null;
  
  // Don't show for users with active trial (new users)
  const hasActiveTrial = user?.trialEnd && calculateTrialDaysLeft(user.trialEnd) > 0;
  
  // Don't show for users without trial data who haven't completed onboarding
  // This prevents showing upgrade prompts during the onboarding process
  const hasNoTrialData = !user?.trialEnd && !user?.isPaid;
  if (onboardingComplete || hasActiveTrial || hasNoTrialData) {
    return null;
  }

  const trialDaysLeft = calculateTrialDaysLeft(user?.trialEnd || null);
  const isTrialActive = user?.trialEnd && trialDaysLeft > 0;
  const isTrialExpired = user?.trialEnd && trialDaysLeft <= 0;

  // Show trial expired message
  if (isTrialExpired) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20 mb-6">
        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {t('trialExpiredUpgradeMessage')}
        </AlertDescription>
        <Button
          onClick={checkout}
          disabled={loading}
          className="mt-2"
          size="sm"
        >
          {loading ? t('redirecting') : t('upgradeNow')}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </Alert>
    );
  }

  // Show trial active message
  if (isTrialActive) {
    return (
      <Card className="border-border bg-card mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg text-foreground">
                {t('freeTrialActive')}
              </CardTitle>
            </div>
            <Badge variant="outline" className="border-accent text-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {trialDaysLeft === 1 ? t('trialDayLeft') : `${trialDaysLeft} ${t('daysLeft')}`}
            </Badge>
          </div>
          <CardDescription className="text-muted-foreground">
            {t('trialProAccessDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {trialDaysLeft <= 7 
                ? t('trialEndingSoon')
                : t('enjoyTrial')
              }
            </div>
            <Button
              onClick={checkout}
              disabled={loading}
              size="sm"
            >
              {loading ? t('redirecting') : t('upgradeNow')}
            </Button>
          </div>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </CardContent>
      </Card>
    );
  }

  // Show upgrade prompt for users without trial
  return (
    <Card className="border-border bg-card mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg text-foreground">
            {t('unlockProFeatures')}
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          {t('subscribeToProDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={checkout}
          disabled={loading}
          size="sm"
        >
          {loading ? t('redirecting') : t('upgradeToPro')}
        </Button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </CardContent>
    </Card>
  );
} 