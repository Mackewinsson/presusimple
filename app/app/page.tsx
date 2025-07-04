"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import BudgetSetupSection from "@/components/budget/BudgetSetupSection";
import DailySpendingTracker from "@/components/expenses/DailySpendingTracker";
import ResetButton from "@/components/ResetButton";
import Summary from "@/components/Summary";
import ThemeToggle from "@/components/ThemeToggle";
import SubscriptionButton from "@/components/SubscriptionButton";
import AccessRestricted from "@/components/AccessRestricted";
import { DollarSign, History, AlertTriangle } from "lucide-react";
import {
  useUserId,
  useBudget,
  useCategories,
  useExpenses,
  useUserSubscription,
} from "@/lib/hooks";
import { useAccessControl } from "@/lib/hooks/useAccessControl";
import { AppLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSubscriptionStatus } from "@/lib/utils";
import { Budget, Category, Expense } from "@/lib/api";

export default function BudgetApp() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Get user ID using React Query
  const { data: userId, isLoading: userIdLoading } = useUserId();

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

  // Check if any data is loading
  const isLoading =
    userIdLoading || budgetLoading || categoriesLoading || expensesLoading;

  React.useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/signin");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return <AppLoadingSkeleton />;
  }

  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  const subscriptionStatus = getSubscriptionStatus(subscription || {});
  const trialExpired = subscriptionStatus === "expired";
  const hasNoSubscription = subscriptionStatus === "none";

  // Show access restricted if user has no access
  if (accessControl.isTrialExpired) {
    return (
      <div className="min-h-screen gradient-bg-dark">
        <header className="border-b border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
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
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <AccessRestricted reason="trial_expired" />
        </main>
      </div>
    );
  }

  if (accessControl.hasNoSubscription) {
    return (
      <div className="min-h-screen gradient-bg-dark">
        <header className="border-b border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
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
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
          <AccessRestricted reason="no_subscription" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg-dark">
      <header className="border-b border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <Link
                href="/history"
                className="flex items-center gap-1.5 sm:gap-2 text-slate-700 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm sm:text-base">
                  History
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
        {/* Trial Expiration Warning */}
        {trialExpired && (
          <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Your free trial has expired. Upgrade to continue using all
              features!
            </AlertDescription>
          </Alert>
        )}

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

      <footer className="border-t border-slate-300/50 dark:border-white/10 py-3 sm:py-4 md:py-6 mt-4 sm:mt-6 md:mt-8 bg-white/5 dark:bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-xs sm:text-sm text-slate-600 dark:text-white/60">
            &copy; {new Date().getFullYear()} Simple Budget. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
