"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBudgetPageData } from "@/lib/hooks";
import { getBudgetBasePath } from "@/lib/budget-routes";
import { useViewport } from "@/hooks/useViewport";
import MobileHeader from "@/components/MobileHeader";
import DailySpendingTracker from "@/components/expenses/DailySpendingTracker";
import { AppLoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function BudgetAddPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, width } = useViewport();
  const {
    session,
    status,
    budget,
    categories,
    expenses,
    accessControl,
    isLoading,
  } = useBudgetPageData();

  // Desktop: redirect to budget; this tab is mobile-only
  // Only redirect after viewport is measured (width > 0) to avoid redirecting on initial mobile render
  const isDesktop = width > 0 && !isMobile;
  useEffect(() => {
    if (isDesktop) {
      router.replace(getBudgetBasePath(pathname));
    }
  }, [isDesktop, pathname, router]);

  if (status === "loading" || !session || isLoading) {
    return <AppLoadingSkeleton />;
  }

  // Still on desktop during redirect
  if (isDesktop) {
    return <AppLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen gradient-bg-dark flex flex-col">
      <MobileHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 md:pb-8">
        {budget && accessControl.canAccessExpenses ? (
          <DailySpendingTracker
            budget={budget}
            categories={categories}
            expenses={expenses}
          />
        ) : null}
      </main>
    </div>
  );
}
