"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Lock, AlertTriangle, Crown } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

interface AccessRestrictedProps {
  reason: "trial_expired" | "no_subscription";
  onUpgrade?: () => void;
}

export default function AccessRestricted({
  reason,
  onUpgrade,
}: AccessRestrictedProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to start subscription:", err);
    } finally {
      setLoading(false);
    }
  };

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
            onClick={handleUpgrade}
            disabled={loading || !session?.user?.email}
            className="w-full"
            size="lg"
          >
            {loading ? t('redirecting') : t('upgradeNow')}
          </Button>
        </div>
      </div>
    );
  }

  if (reason === "no_subscription") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 p-8">
        <div className="text-center space-y-4">
          <Crown className="h-16 w-16 text-orange-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('startYourFreeTrial')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-md">
            {t('unlockAllFeatures')}
          </p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              {t('featuresLockedUntilTrial')}
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleUpgrade}
            disabled={loading || !session?.user?.email}
            className="w-full"
            size="lg"
          >
            {loading ? t('redirecting') : t('startFreeTrial')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
