"use client";

import { Flame } from "lucide-react";

interface StreakBadgeProps {
  streakCount: number;
  size?: "sm" | "md";
  className?: string;
}

export function StreakBadge({ streakCount, size = "md", className = "" }: StreakBadgeProps) {
  if (streakCount < 1) return null;

  const sizeClasses = size === "sm" ? "gap-1 text-sm" : "gap-1.5 text-base";
  const iconSize = size === "sm" ? 16 : 20;

  return (
    <div
      className={`inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 ${sizeClasses} ${className}`}
      title={`${streakCount} day streak`}
    >
      <Flame className="flex-shrink-0" size={iconSize} />
      <span className="font-semibold">{streakCount}</span>
    </div>
  );
}
