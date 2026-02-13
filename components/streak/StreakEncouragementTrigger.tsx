"use client";

import { useState, useEffect } from "react";
import { useStreak } from "@/lib/hooks/useStreak";
import { StreakEncouragementModal } from "./StreakEncouragementModal";
import { STREAK_MODAL_DISMISSED_KEY } from "@/lib/constants/streak";

/**
 * Shows the streak encouragement modal when user opens the app and has an active streak.
 * Only shows once per session (per browser tab).
 */
export function StreakEncouragementTrigger() {
  const { streakCount, isLoading } = useStreak();
  const [showModal, setShowModal] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (isLoading || hasChecked) return;
    if (streakCount < 1) {
      setHasChecked(true);
      return;
    }
    if (typeof sessionStorage === "undefined") return;

    const dismissed = sessionStorage.getItem(STREAK_MODAL_DISMISSED_KEY);
    if (!dismissed) {
      setShowModal(true);
    }
    setHasChecked(true);
  }, [streakCount, isLoading, hasChecked]);

  const handleDismiss = () => {
    setShowModal(false);
  };

  if (!showModal || streakCount < 1) return null;

  return (
    <StreakEncouragementModal
      streakCount={streakCount}
      isOpen={showModal}
      onDismiss={handleDismiss}
    />
  );
}
