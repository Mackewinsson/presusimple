"use client";

import { useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { getChartColor } from "@/lib/theme";
import { parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
} from "lucide-react";
import {
  useMonthlyBudget,
  useMonthlyBudgets,
  useUserId,
  useDeleteMonthlyBudget,
  useCurrentDecimalSeparator,
} from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import MobileHeader from "@/components/MobileHeader";
import { BudgetChartsPanel } from "@/components/budget/BudgetChartsPanel";
import { SnapshotInsights } from "@/components/budget/SnapshotInsights";
import { useTranslation } from "@/lib/i18n";
import type { BudgetExpenseInput } from "@/lib/budget-chart-data";
import { getHistoryBasePath } from "@/lib/budget-routes";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const historyBase = getHistoryBasePath(pathname);
  const budgetId = params.id as string;
  const { t } = useTranslation();

  const { data: userId } = useUserId();
  const decimalSeparator = useCurrentDecimalSeparator();
  const {
    data: selectedBudget,
    isLoading: budgetLoading,
    isFetching: budgetFetching,
  } = useMonthlyBudget(budgetId);
  const { data: allBudgets = [] } = useMonthlyBudgets(userId || "");
  const deleteBudgetMutation = useDeleteMonthlyBudget();

  const isLoading = !userId || budgetLoading || budgetFetching;

  const previousTotalSpent = useMemo(() => {
    if (!selectedBudget || allBudgets.length < 2) return null;
    const sorted = [...allBudgets].sort(
      (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
    );
    const currentIndex = sorted.findIndex((b) => b._id === selectedBudget._id);
    if (currentIndex < 0 || currentIndex >= sorted.length - 1) return null;
    return sorted[currentIndex + 1].totalSpent;
  }, [selectedBudget, allBudgets]);

  const snapshotExpenses: BudgetExpenseInput[] = useMemo(() => {
    if (!selectedBudget?.expenses?.length) return [];
    return selectedBudget.expenses.map((exp) => ({
      amount: exp.amount,
      date:
        typeof exp.date === "string"
          ? exp.date
          : new Date(exp.date).toISOString(),
      type: exp.type,
    }));
  }, [selectedBudget]);

  const hasExpenseSnapshots = snapshotExpenses.length > 0;

  const handleDelete = async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId);
      router.push(historyBase);
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <MobileHeader />

      <header className="hidden md:block border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={historyBase}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("backToHistory")}
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">{t("budgetDetails")}</h1>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("deleteBudget")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("areYouSureDeleteSnapshot")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground"
                  >
                    {t("delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-6">
        {isLoading ? (
          <DetailSkeleton />
        ) : !selectedBudget ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t("snapshotNotFound")}</p>
            <Button onClick={() => router.push(historyBase)} className="mt-4">
              {t("backToHistory")}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-end md:hidden">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteBudget")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("areYouSureDeleteSnapshot")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground"
                    >
                      {t("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-background to-primary/5 pb-3">
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    {t("budgetOverview")}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {selectedBudget.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t("totalBudgeted")}</span>
                      <span className="font-medium">
                        {formatMoney(selectedBudget.totalBudgeted, undefined, decimalSeparator)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{t("totalSpent")}</span>
                      <span className="font-medium">
                        {formatMoney(selectedBudget.totalSpent, undefined, decimalSeparator)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t gap-2">
                      <span className="text-muted-foreground">{t("difference")}</span>
                      <span
                        className={`font-medium ${
                          selectedBudget.totalBudgeted - selectedBudget.totalSpent >= 0
                            ? "text-accent-foreground"
                            : "text-destructive"
                        }`}
                      >
                        {formatMoney(
                          selectedBudget.totalBudgeted - selectedBudget.totalSpent,
                          undefined,
                          decimalSeparator
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="border-b bg-gradient-to-r from-background to-secondary/5 pb-3">
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <ArrowDownCircle className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    {t("transactions")}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {t("transactionsForMonth")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-accent-foreground">
                    {selectedBudget.expensesCount}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("transactionsRecorded")}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
                <CardHeader className="border-b bg-gradient-to-r from-background to-destructive/5 pb-3">
                  <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <ArrowUpCircle className="h-5 w-5 text-destructive" />
                    </div>
                    {t("categories")}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {t("categoriesUsed")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-2xl sm:text-3xl font-bold text-destructive">
                    {selectedBudget.categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("categoriesTracked")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <SnapshotInsights
              categories={selectedBudget.categories}
              totalBudgeted={selectedBudget.totalBudgeted}
              totalSpent={selectedBudget.totalSpent}
              previousTotalSpent={previousTotalSpent}
            />

            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <PieChart className="h-6 w-6 text-primary" />
                  </div>
                  {t("categorySpending")}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t("categorySpendingDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <BudgetChartsPanel
                  categories={selectedBudget.categories}
                  expenses={snapshotExpenses}
                  totalBudgeted={selectedBudget.totalBudgeted}
                  showTimelineCharts={hasExpenseSnapshots}
                  chartHeightClass="h-[250px] sm:h-[300px] md:h-[380px]"
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  {t("categoryDetails")}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {t("detailedCategoryBreakdown")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  {selectedBudget.categories.map((category, index) => (
                    <div
                      key={`${category.name}-${index}`}
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor: getChartColor(index).hex,
                            }}
                          />
                          <span className="font-semibold text-base sm:text-lg truncate">
                            {category.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <div
                            className={`text-base sm:text-lg font-bold ${
                              category.spent > category.budgeted
                                ? "text-destructive"
                                : "text-primary"
                            }`}
                          >
                            {formatMoney(category.spent, undefined, decimalSeparator)}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {t("remainingOf")}{" "}
                            {formatMoney(category.budgeted, undefined, decimalSeparator)}{" "}
                            {t("budgeted")}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ease-out ${
                              category.spent > category.budgeted
                                ? "bg-destructive"
                                : "bg-primary"
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                category.budgeted > 0
                                  ? (category.spent / category.budgeted) * 100
                                  : 0
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm gap-2">
                          <span className="text-muted-foreground">
                            {category.budgeted > 0
                              ? Math.round((category.spent / category.budgeted) * 100)
                              : 0}
                            {t("percentSpent")}
                          </span>
                          <span
                            className={`font-medium ${
                              category.spent > category.budgeted
                                ? "text-destructive"
                                : "text-primary"
                            }`}
                          >
                            {category.spent > category.budgeted
                              ? `+${formatMoney(category.spent - category.budgeted, undefined, decimalSeparator)} ${t("over")}`
                              : formatMoney(
                                  category.budgeted - category.spent,
                                  undefined,
                                  decimalSeparator
                                )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
