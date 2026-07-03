"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useCurrentDecimalSeparator } from "@/lib/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import NewExpenseForm from "./NewExpenseForm";
import ExpenseList from "./ExpenseList";
import { AITransactionInput } from "./AITransactionInput";
import { useFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import type { Budget } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  budgetId: string;
}

interface Expense {
  _id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: "expense" | "income";
}

interface DailySpendingTrackerProps {
  budget: Budget;
  categories: Category[];
  expenses: Expense[];
}

const DailySpendingTracker: React.FC<DailySpendingTrackerProps> = ({
  budget,
  categories,
  expenses,
}) => {
  const { t } = useTranslation();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { hasFeatureAccess, isLoading: isLoadingPlan } = useFeatureFlags();
  const canUseAIInput = hasFeatureAccess("transactionTextInput");

  const totalSpent = expenses.reduce((sum, expense) => {
    return (
      sum + (expense.type === "expense" ? expense.amount : -expense.amount)
    );
  }, 0);

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const remaining = totalBudgeted - totalSpent;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-border/60 bg-card shadow-md ring-1 ring-border/40">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold sm:text-2xl">
              {t("dailySpending")}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t("trackDailyExpenses")}
            </CardDescription>
          </div>

          <div className="flex flex-col gap-0.5 rounded-lg border border-border/50 bg-muted/30 px-4 py-2.5 sm:items-end">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("availableToSpend")}
            </span>
            <span
              className={`text-xl font-semibold tabular-nums sm:text-2xl ${
                remaining < 0 ? "text-destructive" : "text-emerald-600 dark:text-accent"
              }`}
            >
              {formatMoney(remaining, undefined, decimalSeparator)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs
          key={isLoadingPlan ? "loading" : canUseAIInput ? "with-ai" : "without-ai"}
          defaultValue={canUseAIInput ? "ai" : "add"}
          className="w-full"
        >
          <TabsList
            className={`mb-6 grid h-11 w-full gap-1 bg-muted/50 p-1 ${
              canUseAIInput ? "grid-cols-3" : "grid-cols-2"
            }`}
          >
            {canUseAIInput && (
              <TabsTrigger
                value="ai"
                variant="accent"
                className="h-9 gap-1.5 text-xs data-[state=active]:shadow-sm sm:text-sm"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t("aiQuickInput")}</span>
              </TabsTrigger>
            )}
            <TabsTrigger
              value="add"
              variant="accent"
              className="h-9 text-xs data-[state=active]:shadow-sm sm:text-sm"
            >
              {t("addTransaction")}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              variant="accent"
              className="h-9 text-xs data-[state=active]:shadow-sm sm:text-sm"
            >
              {t("transactionHistory")}
            </TabsTrigger>
          </TabsList>

          {canUseAIInput && (
            <TabsContent value="ai" className="mt-0 space-y-4">
              <AITransactionInput budgetId={budget._id} />
            </TabsContent>
          )}

          <TabsContent value="add" className="mt-0 space-y-4">
            <NewExpenseForm
              budget={budget}
              categories={categories}
              expenses={expenses}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-0 space-y-3">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                aria-expanded={isExpanded}
                title={isExpanded ? "Collapse history" : "Expand history"}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-xs">Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-xs">Expand</span>
                  </>
                )}
              </Button>
            </div>

            <div
              className={`overflow-hidden rounded-lg border border-border/40 transition-all duration-300 ease-in-out ${
                isExpanded ? "h-[500px] sm:h-[600px]" : "h-[300px] sm:h-[400px]"
              }`}
            >
              <div className="scrollbar-thin h-full overflow-y-auto p-1 pr-2">
                <ExpenseList categories={categories} expenses={expenses} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailySpendingTracker;
