"use client";

import { useZbbTutorial } from "@/hooks/useZbbTutorial";
import { ZeroBasedBudgetTutorial } from "./ZeroBasedBudgetTutorial";

/**
 * Auto-shows the zero-based budgeting tutorial once per user on the budget page.
 */
export function ZbbTutorialTrigger() {
  const { isOpen, onOpenChange } = useZbbTutorial({ autoShow: true });

  return (
    <ZeroBasedBudgetTutorial open={isOpen} onOpenChange={onOpenChange} />
  );
}
