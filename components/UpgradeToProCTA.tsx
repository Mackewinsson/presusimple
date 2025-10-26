import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock, Crown } from "lucide-react";
import { FEATURES, FeatureKey } from "@/lib/features";
import { useTranslation } from "@/lib/i18n";

interface UpgradeToProCTAProps {
  feature: FeatureKey;
  className?: string;
}

export function UpgradeToProCTA({ feature, className = "" }: UpgradeToProCTAProps) {
  const { t } = useTranslation();
  const featureInfo = FEATURES[feature];

  return (
    <Card className={`border-dashed border-2 border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400 absolute -top-1 -right-1" />
          </div>
        </div>
        <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
          {featureInfo.label}
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {featureInfo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-300">
            <Crown className="h-3 w-3 mr-1" />
            {t('proFeature')}
          </Badge>
        </div>
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {t('upgradeToUnlockFeature')}
        </p>
        <Button 
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
          onClick={() => {
            // TODO: Implement upgrade flow
        
          }}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {t('upgradeToPro')}
        </Button>
      </CardContent>
    </Card>
  );
} 