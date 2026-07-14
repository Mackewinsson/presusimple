"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import BudgetSetupSection from "@/components/budget/BudgetSetupSection";
import DailySpendingTracker from "@/components/expenses/DailySpendingTracker";
import ResetButton from "@/components/ResetButton";
import Summary from "@/components/Summary";
import ThemeToggle from "@/components/ThemeToggle";
import PrivateModeToggle from "@/components/PrivateModeToggle";
import SubscriptionButton from "@/components/SubscriptionButton";
import AccessRestricted from "@/components/AccessRestricted";
import { TrialStatus } from "@/components/TrialStatus";
import { History, AlertTriangle } from "lucide-react";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { AppIcon } from "@/components/ui/app-icon";
import SignOutButton from "@/components/SignOutButton";
import { useBudgetPageData } from "@/lib/hooks";
import { useFeatureFlags as usePlanFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import { useFeatureFlags as useRemoteFeatureFlags } from "@/hooks/useFeatureFlags";
import { AppLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Budget, Category, Expense } from "@/lib/api";
import { UpgradeToProCTA } from "@/components/UpgradeToProCTA";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSearchParams } from "next/navigation";
import { NewUserOnboarding } from "@/components/NewUserOnboarding";
import { Suspense } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import MobileHeader from "@/components/MobileHeader";
import { StreakWidget } from "@/components/streak/StreakWidget";
import { StreakEncouragementTrigger } from "@/components/streak/StreakEncouragementTrigger";
import { ZbbTutorialTrigger } from "@/components/onboarding/ZbbTutorialTrigger";
import { getHistoryBasePath } from "@/lib/budget-routes";

import { useState, useEffect } from "react";
import { useSilentSync } from "@/hooks/useSilentSync";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

function BudgetAppContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const {
    session,
    status,
    userId,
    user,
    budget,
    categories,
    expenses,
    subscription,
    accessControl,
    isLoading,
  } = useBudgetPageData();
  const isNewUser = searchParams.get("newUser") === "true" || session?.isNewUser;
  const planFeatureFlags = usePlanFeatureFlags();
  const remoteFeatureFlags = useRemoteFeatureFlags();
  const isAIFeatureFlagEnabled = remoteFeatureFlags.isFeatureEnabled("aa");

  // Handle return from Lemon Squeezy checkout: refresh subscription data, clear URL
  const checkoutSuccess = searchParams.get("checkout");
  useEffect(() => {
    if (checkoutSuccess !== "success" || !session?.user?.email) return;

    let cancelled = false;
    (async () => {
      try {
        if (cancelled) return;
        toast.success(t("checkoutSuccess") || "Subscription updated. Welcome to Pro!");
        await queryClient.invalidateQueries({ queryKey: ["userSubscription", session.user.email] });
        await queryClient.invalidateQueries({ queryKey: ["userData", session.user.email] });
        router.replace(pathname || "/budget");
      } catch (err) {
        if (!cancelled) toast.error(t("checkoutVerifyError") || "Could not verify checkout.");
      }
    })();
    return () => { cancelled = true; };
  }, [checkoutSuccess, session?.user?.email, pathname, router, queryClient, t]);

  // Silent sync for PWA - checks for updates in background
  useSilentSync({
    enabled: !!userId,
    initialDelay: 2000, // Wait 2 seconds after load
    checkInterval: 30000, // Check every 30 seconds
    onUpdatesAvailable: () => {
      // Optional: show a subtle notification
      console.log('[PWA] Updates detected and loaded in background');
    },
  });

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }

    // Check if user is new and redirect to welcome page
    // Only redirect if user is new AND hasn't completed onboarding
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    
    if (session.isNewUser && !isLoading && !onboardingComplete) {
      router.replace("/budget/welcome");
      return;
    }
  }, [session, status, router, isLoading]);

  if (status === "loading" || !session) {
    return <AppLoadingSkeleton />;
  }

  // Show loading skeleton while user data is being fetched
  if (isLoading) {
    return <AppLoadingSkeleton />;
  }



  const onboardingComplete =
    typeof window !== "undefined"
      ? localStorage.getItem("onboardingComplete")
      : null;
  const hasProAccess = accessControl.isPaid || accessControl.isInTrial;

  if (
    !isLoading &&
    !accessControl.isLoading &&
    !hasProAccess &&
    onboardingComplete
  ) {
    return (
      <AccessRestricted
        reason={accessControl.isTrialExpired ? "trial_expired" : "no_subscription"}
      />
    );
  }

  return (
    <ErrorBoundary>
      <StreakEncouragementTrigger />
      <ZbbTutorialTrigger />
      <div className="min-h-screen gradient-bg-dark flex flex-col">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Desktop Header */}
        <header className="hidden md:block border-b border-border bg-card/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-90 transition-opacity"
                >
                  <AppIcon size={24} className="h-4 w-4 sm:h-6 sm:w-6" />
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Presusimple
                  </h1>
                </Link>
                <span className="text-sm sm:text-base text-muted-foreground">
                  {isNewUser ? `${t('welcomeNew')}, ${session?.user?.name}!` : `${t('welcomeBack')}, ${session?.user?.name}!`}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <StreakWidget />
                <LanguageSwitcher />
                <PrivateModeToggle />
                <ThemeToggle />
                <SignOutButton
                  variant="outline"
                  size="sm"
                  showText={true}
                  className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground border-border bg-card/50 backdrop-blur-sm"
                />
                <Link
                  href={getHistoryBasePath(pathname || "/budget")}
                  className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <History className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline text-sm sm:text-base">
                    {t('history')}
                  </span>
                </Link>
                <AdminNavLink />
              </div>
            </div>
          </div>
        </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8 pb-28 md:pb-8">
        {/* Trial Status */}
        <TrialStatus />

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
          {/* LEFT COLUMN: DailySpendingTracker and Summary goes first */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 flex flex-col order-1">
            <SubscriptionButton />
            
            {budget && accessControl.canAccessExpenses && (
              <DailySpendingTracker
                budget={budget}
                categories={categories}
                expenses={expenses}
              />
            )}

            {budget && accessControl.canAccessBudget && (
              <Summary
                budget={budget}
                categories={categories}
                expenses={expenses}
              />
            )}
          </div>

          {/* RIGHT COLUMN: Budget Setup and Reset */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8 flex flex-col order-2">
            {accessControl.canCreateBudget && (
              <BudgetSetupSection
                budget={budget || null}
                categories={categories}
              />
            )}

            {accessControl.canResetBudget && (
              <ResetButton
                budget={budget || null}
                categories={categories}
                expenses={expenses}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-border py-3 sm:py-4 md:py-6 bg-card/5 backdrop-blur-sm hidden md:block">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Presusimple. All rights
            reserved.
          </p>
        </div>
      </footer>
      

      </div>
    </ErrorBoundary>
  );
}

export default function BudgetApp() {
  return (
    <Suspense fallback={<AppLoadingSkeleton />}>
      <BudgetAppContent />
    </Suspense>
  );
}
