"use client";

import { useStreak } from "@/lib/hooks/useStreak";
import { StreakBadge } from "./StreakBadge";

export function StreakWidget() {
  const { streakCount } = useStreak();

  return <StreakBadge streakCount={streakCount} size="sm" />;
}
