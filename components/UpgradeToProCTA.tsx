"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Crown } from "lucide-react";
import { FEATURES, FeatureKey } from "@/lib/features";
import { useTranslation } from "@/lib/i18n";
import { useCheckout } from "@/hooks/useCheckout";

interface UpgradeToProCTAProps {
  feature: FeatureKey;
  className?: string;
}

export function UpgradeToProCTA({ feature, className = "" }: UpgradeToProCTAProps) {
  const { t } = useTranslation();
  const { checkout, loading, canCheckout } = useCheckout();
  const featureInfo = FEATURES[feature];

  return (
    <Card className={`border-dashed border-2 border-border bg-card ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <Crown className="h-4 w-4 text-accent absolute -top-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-lg text-foreground">
          {featureInfo.label}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {featureInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="border-accent text-foreground">
            <Crown className="h-3 w-3 mr-1" />
            {t('proFeature')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('upgradeToUnlockFeature')}
        </p>
        <Button
          onClick={checkout}
          disabled={loading || !canCheckout}
          className="font-semibold"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? t('redirecting') : t('upgradeToPro')}
        </Button>
      </CardContent>
    </Card>
  );
} 