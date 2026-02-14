"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { STREAK_MODAL_DISMISSED_KEY } from "@/lib/constants/streak";
import { useTranslation } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

const ENCOURAGEMENT_KEYS: Record<number, TranslationKey> = {
  1: "streakEncouragement1",
  2: "streakEncouragement2",
  3: "streakEncouragement3",
  5: "streakEncouragement5",
  7: "streakEncouragement7",
  10: "streakEncouragement10",
  14: "streakEncouragement14",
  30: "streakEncouragement30",
};

function getEncouragementKey(streakCount: number): TranslationKey {
  const exact = ENCOURAGEMENT_KEYS[streakCount];
  if (exact) return exact;
  if (streakCount >= 30) return "streakEncouragementDaysMaster";
  if (streakCount >= 14) return "streakEncouragementDaysIncredible";
  if (streakCount >= 7) return "streakEncouragementDaysKeepItUp";
  if (streakCount >= 3) return "streakEncouragementDaysWellDone";
  return "streakEncouragementDaysGreat";
}

function interpolateCount(text: string, count: number): string {
  return text.replace(/\{\{count\}\}/g, String(count));
}

interface StreakEncouragementModalProps {
  streakCount: number;
  isOpen: boolean;
  onDismiss: () => void;
}

export function StreakEncouragementModal({
  streakCount,
  isOpen,
  onDismiss,
}: StreakEncouragementModalProps) {
  const { t } = useTranslation();

  const handleContinue = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STREAK_MODAL_DISMISSED_KEY, "true");
    }
    onDismiss();
  };

  const encouragementKey = getEncouragementKey(streakCount);
  const message = interpolateCount(t(encouragementKey), streakCount);
  const title = interpolateCount(t("streakTitle"), streakCount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleContinue()}>
      <DialogContent className="sm:max-w-md border border-warning/20 shadow-2xl bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-warning/10 to-transparent pointer-events-none" />
        <DialogHeader className="relative flex flex-col items-center pt-4 pb-2">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-warning shadow-lg">
            <Flame className="h-14 w-14 text-warning-foreground drop-shadow-md" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="relative text-center pb-6">
          <p className="text-lg text-foreground font-medium">
            {message}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("streakSubtitle")}
          </p>
        </div>
        <div className="relative flex justify-center pb-4">
          <Button
            onClick={handleContinue}
            size="lg"
            className="font-semibold px-8"
          >
            {t("streakCta")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
