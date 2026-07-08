"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle, Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useCheckout } from "@/hooks/useCheckout";

interface AccessRestrictedProps {
  reason: "trial_expired" | "no_subscription";
  onUpgrade?: () => void;
}

export default function AccessRestricted({
  reason,
  onUpgrade,
}: AccessRestrictedProps) {
  const { t } = useTranslation();
  const { checkout, loading, canCheckout, error } = useCheckout();

  if (reason === "trial_expired") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('trialExpired')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            {t('trialExpiredDescription')}
          </p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <Lock className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              {t('allFeaturesLocked')}
            </AlertDescription>
          </Alert>

          <Button
            onClick={checkout}
            disabled={loading || !canCheckout}
            className="w-full"
            size="lg"
          >
            {loading ? t('redirecting') : t('upgradeNow')}
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </div>
    );
  }

  if (reason === "no_subscription") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
        <div className="text-center space-y-4">
          <Crown className="h-16 w-16 text-success mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('unlockProFeatures')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            {t('subscribeToProDescription')}
          </p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Alert className="border-border bg-card">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="text-foreground">
              {t('subscribeToProLockedMessage')}
            </AlertDescription>
          </Alert>

          <Button
            onClick={checkout}
            disabled={loading || !canCheckout}
            className="w-full"
            size="lg"
          >
            {loading ? t('redirecting') : t('upgradeToPro')}
          </Button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>
      </div>
    );
  }

  return null;
}
