"use client";

import { useEffect } from "react";
import { useStreak } from "@/lib/hooks/useStreak";
import { StreakBadge } from "./StreakBadge";

export function StreakWidget() {
  const { streakCount, recordActivity } = useStreak();

  useEffect(() => {
    recordActivity();
  }, [recordActivity]);

  return <StreakBadge streakCount={streakCount} size="sm" />;
}
