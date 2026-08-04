"use client";

import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface NewUserOnboardingProps {
  onComplete: () => void;
}

export function NewUserOnboarding({ onComplete }: NewUserOnboardingProps) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center space-y-8 p-8 bg-card border border-border rounded-2xl shadow-xl">
        <div className="flex justify-center mb-4">
          <span className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8" />
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t("welcomeToPresusimpleExclaim")}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{t("unlockAllFeatures")}</p>
        <Button onClick={onComplete} className="font-semibold px-8 py-3 text-lg" size="lg">
          {t("startBudgetingNow")}
        </Button>
      </div>
    </div>
  );
}
