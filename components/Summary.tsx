"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { SpendingChart } from "@/components/ui/SpendingChart";
import { useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DistributionChart } from "@/components/ui/DistributionChart";
import { TrendChart } from "@/components/ui/TrendChart";
import { BurndownChart } from "@/components/ui/BurndownChart";
import { CashFlowChart } from "@/components/ui/CashFlowChart";
import { PieChart, TrendingUp, Activity, BarChart3, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Button } from "./ui/button";
import { FileSpreadsheet } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { toast } from "sonner";
import type { Budget } from "@/lib/api";

const EXCEL_SHEET_NAME_MAX_LENGTH = 31;

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

interface SummaryProps {
  budget: Budget;
  categories: Category[];
  expenses: Expense[];
}

const Summary: React.FC<SummaryProps> = ({ budget, categories, expenses }) => {
  const { t } = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const decimalSeparator = useCurrentDecimalSeparator();
  // Calculate total spent from expenses
  const totalSpent = expenses.reduce((sum, expense) => {
    return (
      sum + (expense.type === "expense" ? expense.amount : -expense.amount)
    );
  }, 0);

  // Calculate total budgeted from categories (this should match database totalBudgeted)
  const calculatedTotalBudgeted = categories.reduce(
    (sum, cat) => sum + cat.budgeted,
    0
  );

  // Calculate spent for each category from expenses
  const categoriesWithSpent = categories.map((category) => {
    const spent = expenses
      .filter((exp) => exp.categoryId === (category._id || category.id))
      .reduce((sum, exp) => {
        if (exp.type === "expense") return sum + exp.amount;
        if (exp.type === "income") return sum - exp.amount;
        return sum;
      }, 0);
    return { ...category, spent };
  });

  // Get top spending categories for chart
  const chartCategories = [...categoriesWithSpent]
    .filter(cat => cat.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent) // Sort by spent amount (highest first)
    .slice(0, 8); // Show top 8 spending categories (increased for better coverage)

  // Handle edge cases
  const hasSpendingData = chartCategories.length > 0;
  const hasMultipleCategories = chartCategories.length > 1;

  const chartData = chartCategories.map((cat) => ({
    name: cat.name,
    spent: Number(cat.spent) || 0,
    budgeted: Number(cat.budgeted) || 0,
    overBudget: (Number(cat.spent) || 0) > (Number(cat.budgeted) || 0),
  })).filter(item => item.budgeted > 0 || item.spent > 0);

  const trendData = expenses
    .filter(e => e.type === "expense")
    .map(e => ({ date: e.date, amount: e.amount }));

  const burndownData = expenses
    .filter(e => e.type === "expense")
    .map(e => ({ date: e.date, spent: e.amount }));

  const cashFlowData = expenses.map(e => {
    const isIncome = e.type?.toLowerCase() === "income";
    return {
      date: e.date,
      income: isIncome ? e.amount : 0,
      expense: !isIncome ? e.amount : 0,
    };
  });  const handleExportToExcel = () => {
    try {
      const wb = utils.book_new();

      // Excel number format: dot e.g. #,##0.00, comma e.g. #.##0,00; prefix with currency symbol
      const numFmt =
        decimalSeparator === "comma"
          ? `"${currentCurrency.symbol}"#.##0,00`
          : `"${currentCurrency.symbol}"#,##0.00`;

      // --- Budget Summary sheet ---
      const summaryData = [
        [t('budgetSummary'), ""],
        [t('totalBudgeted'), budget.totalBudgeted],
        [t('totalSpent'), totalSpent],
        [t('remaining'), budget.totalBudgeted - totalSpent],
        [],
        [t('category'), t('budgeted'), t('totalSpent'), t('remaining')],
      ];

      categoriesWithSpent.forEach((category) => {
        summaryData.push([
          category.name,
          category.budgeted,
          category.spent,
          category.budgeted - category.spent,
        ]);
      });

      const summaryWs = utils.aoa_to_sheet(summaryData);

      // Column widths (Summary: 2 cols for key-value, 4 for table)
      summaryWs["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];

      // Number format for totals (B2, B3, B4) and category table (B7:D7, B8:D8, ...)
      ["B2", "B3", "B4"].forEach((ref) => {
        if (summaryWs[ref]) summaryWs[ref].z = numFmt;
      });
      const summaryTableStartRow = 7;
      categoriesWithSpent.forEach((_, i) => {
        const r = summaryTableStartRow + i;
        ["B", "C", "D"].forEach((col) => {
          const ref = `${col}${r}`;
          if (summaryWs[ref]) summaryWs[ref].z = numFmt;
        });
      });

      // --- Expenses sheet (5 columns: date, category, description, amount, type) ---
      const expensesData: (string | number)[][] = [
        [t('transactionHistory'), "", "", "", ""],
        [t('date'), t('category'), t('description'), t('amount'), t('type')],
      ];

      expenses.forEach((expense) => {
        const category = categories.find(
          (c) => c._id === expense.categoryId || c.id === expense.categoryId
        );
        const signedAmount =
          expense.type === "income" ? -expense.amount : expense.amount;
        expensesData.push([
          format(parseISO(expense.date), "yyyy-MM-dd"),
          category?.name || t('unknown'),
          expense.description || "-",
          signedAmount,
          expense.type,
        ]);
      });

      const expensesWs = utils.aoa_to_sheet(expensesData);

      // Column widths (Expenses: date, category, description, amount, type)
      expensesWs["!cols"] = [
        { wch: 12 },
        { wch: 18 },
        { wch: 30 },
        { wch: 12 },
        { wch: 10 },
      ];

      // Number format for amount column (D3, D4, ...)
      expenses.forEach((_, i) => {
        const ref = `D${i + 3}`;
        if (expensesWs[ref]) expensesWs[ref].z = numFmt;
      });

      // Sheet names: Excel limit 31 chars
      const summarySheetName = t('budgetSummary').slice(0, EXCEL_SHEET_NAME_MAX_LENGTH);
      const expensesSheetName = t('transactionHistory').slice(0, EXCEL_SHEET_NAME_MAX_LENGTH);

      utils.book_append_sheet(wb, summaryWs, summarySheetName);
      utils.book_append_sheet(wb, expensesWs, expensesSheetName);

      const filename = `budget-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      writeFile(wb, filename);
      toast.success(t('excelExportSuccess'));
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error(t('excelExportFailed'));
    }
  };

  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('budgetSummary')}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {t('overviewBudgetCategories')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToExcel}
              className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
            >
              <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t('excel')}</span>
              <span className="sm:hidden">XLS</span>
            </Button>

          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-3 sm:p-4 rounded-xl bg-secondary/50 backdrop-blur text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('totalBudgeted')}
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold">
                              {formatMoney(calculatedTotalBudgeted, currentCurrency, decimalSeparator)}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-primary/5 backdrop-blur text-center">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('totalSpent')}
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-semibold">
                              {formatMoney(totalSpent, currentCurrency, decimalSeparator)}
            </div>
          </div>

          <div className={`p-3 sm:p-4 rounded-xl backdrop-blur text-center sm:col-span-2 lg:col-span-1 ${
            calculatedTotalBudgeted - totalSpent < 0 ? "bg-destructive/10" : "bg-accent/10"
          }`}>
            <div className="text-xs sm:text-sm text-muted-foreground mb-1">
              {t('remaining')}
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-semibold ${
                calculatedTotalBudgeted - totalSpent < 0
                  ? "text-destructive"
                  : "text-accent-foreground"
              }`}
            >
                              {formatMoney(calculatedTotalBudgeted - totalSpent, currentCurrency, decimalSeparator)}
            </div>
          </div>
        </div>

        {categories.length > 0 ? (
          <div className="mt-6 sm:mt-8">
            <Tabs defaultValue="categories" className="w-full">
              <div className="flex justify-between items-center mb-4 sm:mb-6 flex-wrap gap-4">
                <h3 className="text-base sm:text-lg font-medium">
                  {t('topSpendingCategories')}
                </h3>
                <TabsList className="bg-muted/50 h-9 p-1">
                  <TabsTrigger value="categories" className="h-7 text-xs px-2 sm:px-3 gap-1.5" title={t('tabCategories')}>
                    <BarChart className="h-3.5 w-3.5 hidden sm:inline-block" />
                    <span className="sm:hidden">{t('tabCategoriesShort')}</span>
                    <span className="hidden sm:inline">{t('tabCategories')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="distribution" className="h-7 text-xs px-2 sm:px-3 gap-1.5" title={t('tabDistribution')}>
                    <PieChart className="h-3.5 w-3.5 hidden sm:inline-block" />
                    <span className="sm:hidden">{t('tabDistributionShort')}</span>
                    <span className="hidden sm:inline">{t('tabDistribution')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="trend" className="hidden h-7 text-xs px-2 sm:px-3 gap-1.5" title={t('tabTrend')}>
                    <TrendingUp className="h-3.5 w-3.5 hidden sm:inline-block" />
                    <span className="sm:hidden">{t('tabTrendShort')}</span>
                    <span className="hidden sm:inline">{t('tabTrend')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="burndown" className="hidden h-7 text-xs px-2 sm:px-3 gap-1.5" title={t('tabBurndown')}>
                    <Activity className="h-3.5 w-3.5 hidden sm:inline-block" />
                    <span className="sm:hidden">{t('tabBurndownShort')}</span>
                    <span className="hidden sm:inline">{t('tabBurndown')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="cashflow" className="h-7 text-xs px-2 sm:px-3 gap-1.5" title={t('tabCashFlow')}>
                    <BarChart3 className="h-3.5 w-3.5 hidden sm:inline-block" />
                    <span className="sm:hidden">{t('tabCashFlowShort')}</span>
                    <span className="hidden sm:inline">{t('tabCashFlow')}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="h-[250px] sm:h-[300px] md:h-[350px] flex flex-col" data-testid="summary-chart">
                {hasSpendingData ? (
                  <>
                    <TabsContent value="categories" className="flex-1 overflow-x-auto overflow-y-hidden mt-0 h-full border-none p-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                      <div className="min-w-full h-full" style={{ minWidth: `${Math.max(chartCategories.length * 120, 400)}px` }}>
                        <SpendingChart 
                          data={chartData}
                          showBudgeted={true}
                          showLegend={false}
                          height="100%"
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="distribution" className="flex-1 mt-0 h-full">
                      {hasMultipleCategories ? (
                        <DistributionChart data={chartData} height="100%" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t('noSpendingDataAvailable')}</div>
                      )}
                    </TabsContent>

                    <TabsContent value="trend" className="hidden flex-1 mt-0 h-full">
                      {trendData.length > 0 ? (
                        <TrendChart data={trendData} height="100%" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t('noSpendingDataAvailable')}</div>
                      )}
                    </TabsContent>

                    <TabsContent value="burndown" className="hidden flex-1 mt-0 h-full">
                      {burndownData.length > 0 ? (
                        <BurndownChart data={burndownData} totalBudget={calculatedTotalBudgeted} height="100%" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t('noSpendingDataAvailable')}</div>
                      )}
                    </TabsContent>

                    <TabsContent value="cashflow" className="flex-1 mt-0 h-full">
                      {cashFlowData.length > 0 ? (
                        <CashFlowChart data={cashFlowData} height="100%" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">{t('noSpendingDataAvailable')}</div>
                      )}
                    </TabsContent>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {categories.length === 0 
                          ? t('noCategoriesAvailable') 
                          : t('noSpendingDataAvailable')
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {categories.length === 0 
                          ? t('addBudgetCategoriesToSee') 
                          : t('addExpensesToSeePatterns')
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-muted/30">
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('addBudgetCategoriesToSee')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Summary;
