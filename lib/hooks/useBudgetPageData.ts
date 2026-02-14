"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUserId, useUserSubscription } from "./useUserId";
import { useBudget } from "./useBudgetQueries";
import { useCategories } from "./useCategoryQueries";
import { useExpenses } from "./useExpenseQueries";
import { useAccessControl } from "./useAccessControl";
import { useUserData } from "./useUserData";
import type { Category, Expense } from "@/lib/api";

/**
 * Shared hook for budget-related pages (/budget and /budget/add).
 * Centralizes session, user, budget data, and access control.
 * Redirects to login when there is no session.
 */
export function useBudgetPageData() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: userId, isLoading: userIdLoading } = useUserId();
  const { data: user, isLoading: userLoading } = useUserData();
  const { data: budget, isLoading: budgetLoading } = useBudget(userId || "");
  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    userId || ""
  );
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses(
    userId || ""
  );
  const { data: subscription } = useUserSubscription();
  const accessControl = useAccessControl();

  const hasNoData = !budget && !categories.length && !expenses.length;
  const isInitialLoad =
    (budgetLoading || categoriesLoading || expensesLoading) && hasNoData;
  const isLoading = userIdLoading || userLoading || isInitialLoad;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/auth/login");
    }
  }, [session, status, router]);

  return {
    session,
    status,
    userId,
    user,
    budget: budget ?? null,
    categories: categories as Category[],
    expenses: expenses as Expense[],
    subscription,
    accessControl,
    isLoading,
  };
}
