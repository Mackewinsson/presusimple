"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BudgetSetupSection from "@/components/budget/BudgetSetupSection";
import DailySpendingTracker from "@/components/expenses/DailySpendingTracker";
import { AITransactionInput } from "@/components/expenses/AITransactionInput";
import ResetButton from "@/components/ResetButton";
import Summary from "@/components/Summary";
import ThemeToggle from "@/components/ThemeToggle";
import SubscriptionButton from "@/components/SubscriptionButton";
import AccessRestricted from "@/components/AccessRestricted";
import { TrialStatus } from "@/components/TrialStatus";
import { DollarSign, History, AlertTriangle } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";
import {
  useUserId,
  useBudget,
  useCategories,
  useExpenses,
  useUserSubscription,
} from "@/lib/hooks";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { useFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import { useUserData } from "@/lib/hooks/useUserData";
import { AppLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSubscriptionStatus } from "@/lib/utils";
import { Budget, Category, Expense } from "@/lib/api";
import { UpgradeToProCTA } from "@/components/UpgradeToProCTA";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSearchParams } from "next/navigation";
import { NewUserOnboarding } from "@/components/NewUserOnboarding";
import { Suspense } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import PWAInstaller from "@/components/PWAInstaller";

function BudgetAppContent() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("newUser") === "true" || session?.isNewUser;

  // Get user ID using React Query
  const { data: userId, isLoading: userIdLoading } = useUserId();

  // Get user data for trial/subscription status
  const { data: user, isLoading: userLoading } = useUserData();

  // Get data using React Query
  const { data: budget, isLoading: budgetLoading } = useBudget(userId || "");
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    userId || ""
  );
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(
    userId || ""
  );
  const { data: subscription } = useUserSubscription();
  const accessControl = useAccessControl();
  const featureFlags = useFeatureFlags();

  // Check if any data is loading
  const isLoading =
    userIdLoading || 
    userLoading || 
    budgetLoading || 
    categoriesLoading || 
    expensesLoading;

  // Only check subscription status after user data has loaded
  const subscriptionStatus = getSubscriptionStatus(subscription || {});
  const trialExpired = subscriptionStatus === "expired";
  const hasNoSubscription = subscriptionStatus === "none";

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
      return;
    }

    // Check if user is new and redirect to welcome page
    // Only redirect if user is new AND hasn't completed onboarding
    const onboardingComplete = localStorage.getItem("onboardingComplete");
    console.log("Debug - session.isNewUser:", session.isNewUser);
    console.log("Debug - userLoading:", userLoading);
    console.log("Debug - onboardingComplete:", onboardingComplete);
    
    if (session.isNewUser && !userLoading && !onboardingComplete) {
      console.log("New user detected, redirecting to welcome page");
      router.replace("/app/welcome");
      return;
    }
  }, [session, status, router, userLoading]);

  if (status === "loading" || !session) {
    return <AppLoadingSkeleton />;
  }

  // Show loading skeleton while user data is being fetched
  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  console.log("App page - Subscription status:", subscriptionStatus);
  console.log("App page - Access control:", accessControl);
  console.log("App page - Can create budget:", accessControl.canCreateBudget);

  // Show access restricted for trial expired or no subscription
  // But only after we've confirmed the user data has loaded and access control is not loading
  // Don't show for users who are in the onboarding process (no trial data yet)
  const onboardingComplete = typeof window !== 'undefined' ? localStorage.getItem("onboardingComplete") : null;
  const hasNoTrialData = !user?.trialEnd && !user?.isPaid;
  
  if (!userLoading && !accessControl.isLoading && (trialExpired || hasNoSubscription) && !hasNoTrialData) {
    return (
      <AccessRestricted
        reason={trialExpired ? "trial_expired" : "no_subscription"}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen gradient-bg-dark flex flex-col">
      <header className="border-b border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 sm:gap-3 w-fit hover:opacity-90 transition-opacity"
              >
                <div className="bg-white dark:bg-white text-slate-900 p-1.5 sm:p-2 rounded-xl shadow-lg">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Simple Budget
                </h1>
              </Link>
              <span className="text-sm sm:text-base text-slate-600 dark:text-white/70">
                {isNewUser ? `${t('welcomeNew')}, ${session?.user?.name}!` : `${t('welcomeBack')}, ${session?.user?.name}!`}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              <SignOutButton
                variant="outline"
                size="sm"
                showText={true}
                className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white border-slate-300/50 dark:border-white/20 bg-white/50 dark:bg-white/10 backdrop-blur-sm"
              />
              <Link
                href="/history"
                className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm sm:text-base">
                  {t('history')}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Trial Status */}
        <TrialStatus />

        <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            <SubscriptionButton />
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
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* AI Quick Input - Now with feature flags */}
            {budget && accessControl.canAccessExpenses && featureFlags.hasFeatureAccess("transactionTextInput") && (
              <AITransactionInput budgetId={budget._id} />
            )}
            {budget && accessControl.canAccessExpenses && !featureFlags.hasFeatureAccess("transactionTextInput") && (
              <UpgradeToProCTA feature="transactionTextInput" />
            )}
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
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-300/50 dark:border-white/10 py-3 sm:py-4 md:py-6 bg-white/5 dark:bg-white/5 backdrop-blur-sm sticky bottom-0 sm:static">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-white/60">
            &copy; {new Date().getFullYear()} Simple Budget. All rights
            reserved.
          </p>
        </div>
      </footer>
      
      {/* PWA Installer */}
      <PWAInstaller />
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
