"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Search, Trash2, TrendingUp } from "lucide-react";
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
import { toast } from "sonner";
import {
  useMonthlyBudgets,
  useDeleteMonthlyBudget,
  useUserId,
  useCurrentDecimalSeparator,
} from "@/lib/hooks";
import { HistoryItemSkeleton } from "@/components/ui/loading-skeleton";
import MobileHeader from "@/components/MobileHeader";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { useTranslation } from "@/lib/i18n";
import { getBudgetBasePath, getHistoryBasePath } from "@/lib/budget-routes";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const budgetBase = getBudgetBasePath(pathname);
  const historyBase = getHistoryBasePath(pathname);
  const { t } = useTranslation();
  const { data: userId } = useUserId();
  const { data: budgets = [], isLoading: budgetsLoading } = useMonthlyBudgets(
    userId || ""
  );
  const deleteBudgetMutation = useDeleteMonthlyBudget();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { formatAmount, isPrivateMode } = useFormatMoney();

  const sortedBudgets = [...budgets].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
  );

  const filteredBudgets = sortedBudgets.filter((budget) =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteBudgetMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("deleteBudgetHistory"));
      },
      onError: (error) => {
        console.error("Error deleting budget:", error);
        toast.error(t("deleteBudgetHistory"));
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <header className="hidden md:block border-b bg-card/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={budgetBase}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("backToBudget")}
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">{t("budgetHistory")}</h1>
            </div>

            <div className="flex items-center gap-3">
              <AdminNavLink />
              <Link href={`${historyBase}/insights`}>
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t("viewInsights")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("searchBudgetHistory")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Link href={`${historyBase}/insights`} className="md:hidden">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t("viewInsights")}
              </Button>
            </Link>
          </div>

          {budgetsLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <HistoryItemSkeleton key={i} />
              ))}
            </div>
          ) : filteredBudgets.length > 0 ? (
            <div className="grid gap-4">
              {filteredBudgets.map((budget) => (
                <Card
                  key={budget._id}
                  className="glass-card hover-card cursor-pointer transition-all duration-200 md:hover:scale-[1.02]"
                  onClick={() => router.push(`${historyBase}/${budget._id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <CardTitle className="truncate">{budget.name}</CardTitle>
                        <CardDescription>
                          {format(parseISO(budget.createdAt), "PPP")}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            disabled={deleteBudgetMutation.isPending}
                          >
                            {deleteBudgetMutation.isPending ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg sm:text-xl">
                              {t("deleteBudgetHistory")}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base">
                              {t("areYouSureDeleteSnapshot")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-sm sm:text-base">
                              {t("cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget._id)}
                              className="text-sm sm:text-base"
                            >
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {t("totalBudgeted")}
                        </div>
                        <div className="font-medium text-sm sm:text-base">
                          <span className={cn(isPrivateMode && "sensitive-amount")}>
                            {formatAmount(budget.totalBudgeted, undefined, decimalSeparator)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {t("totalSpent")}
                        </div>
                        <div className="font-medium text-sm sm:text-base">
                          <span className={cn(isPrivateMode && "sensitive-amount")}>
                            {formatAmount(budget.totalSpent, undefined, decimalSeparator)}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {t("categories")}
                        </div>
                        <div className="font-medium text-sm sm:text-base">
                          {budget.categories.length}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs sm:text-sm text-muted-foreground">
                          {t("transactions")}
                        </div>
                        <div className="font-medium text-sm sm:text-base">
                          {budget.expensesCount}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 rounded-lg bg-card/95 backdrop-blur shadow-lg">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? t("noMatchingBudgets") : t("noBudgetHistoryYet")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? t("searchTransactions")
                      : t("noBudgetHistoryHint")}
                  </p>
                  {!searchTerm && (
                    <Link href={budgetBase}>
                      <Button>{t("goToBudget")}</Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
