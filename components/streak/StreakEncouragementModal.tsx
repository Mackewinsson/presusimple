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

const ENCOURAGEMENT_MESSAGES: Record<number, string> = {
  1: "You're on fire! First day streak! 🔥",
  2: "2 days in a row! Keep it going!",
  3: "3 day streak! You're building a habit!",
  5: "5 day streak! You're unstoppable!",
  7: "A full week! Incredible dedication!",
  10: "10 days! You're a budgeting champion!",
  14: "2 weeks strong! Amazing!",
  30: "30 days! You're a budgeting master!",
};

function getEncouragement(streakCount: number): string {
  const exact = ENCOURAGEMENT_MESSAGES[streakCount];
  if (exact) return exact;
  if (streakCount >= 30) return `${streakCount} days! You're a budgeting master!`;
  if (streakCount >= 14) return `${streakCount} day streak! Incredible!`;
  if (streakCount >= 7) return `${streakCount} day streak! Keep it up!`;
  if (streakCount >= 3) return `${streakCount} days in a row! Well done!`;
  return `${streakCount} day streak! You're doing great!`;
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
  const handleContinue = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(STREAK_MODAL_DISMISSED_KEY, "true");
    }
    onDismiss();
  };

  const message = getEncouragement(streakCount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleContinue()}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.15),transparent_50%)]" />
        <DialogHeader className="relative flex flex-col items-center pt-4 pb-2">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <Flame className="h-14 w-14 text-white drop-shadow-md" strokeWidth={1.5} />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-amber-900 dark:text-amber-100">
            {streakCount} Day Streak!
          </DialogTitle>
        </DialogHeader>
        <div className="relative text-center pb-6">
          <p className="text-lg text-amber-800/90 dark:text-amber-200/90 font-medium">
            {message}
          </p>
          <p className="mt-3 text-sm text-amber-700/70 dark:text-amber-300/70">
            Keep tracking your budget every day to maintain your streak.
          </p>
        </div>
        <div className="relative flex justify-center pb-4">
          <Button
            onClick={handleContinue}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 shadow-lg shadow-amber-500/25"
          >
            Let&apos;s go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
