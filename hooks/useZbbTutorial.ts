"use client";

import { useCallback, useEffect, useState } from "react";
import { ZBB_TUTORIAL_SEEN_KEY } from "@/lib/constants/onboarding";

interface UseZbbTutorialOptions {
  /** When true, opens the tutorial once if the user has not seen it yet */
  autoShow?: boolean;
}

export function useZbbTutorial(options: UseZbbTutorialOptions = {}) {
  const { autoShow = false } = options;
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedAutoShow, setHasCheckedAutoShow] = useState(false);

  useEffect(() => {
    if (!autoShow || hasCheckedAutoShow) return;
    if (typeof window === "undefined") return;

    const seen = localStorage.getItem(ZBB_TUTORIAL_SEEN_KEY);
    if (!seen) {
      setIsOpen(true);
    }
    setHasCheckedAutoShow(true);
  }, [autoShow, hasCheckedAutoShow]);

  const markTutorialSeen = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ZBB_TUTORIAL_SEEN_KEY, "true");
    }
  }, []);

  const openTutorial = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    markTutorialSeen();
    setIsOpen(false);
  }, [markTutorialSeen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
        return;
      }
      closeTutorial();
    },
    [closeTutorial]
  );

  return {
    isOpen,
    openTutorial,
    closeTutorial,
    onOpenChange: handleOpenChange,
  };
}
