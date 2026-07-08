"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { BudgetChartsPanel } from "@/components/budget/BudgetChartsPanel";
import { Button } from "./ui/button";
import { FileSpreadsheet } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
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
  const chartExpenseInputs = expenses.map((e) => ({
    amount: e.amount,
    date: e.date,
    type: e.type,
  }));

  const handleExportToExcel = () => {
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
          <div className="mt-6 sm:mt-8" data-testid="summary-chart">
            <BudgetChartsPanel
              categories={categoriesWithSpent}
              expenses={chartExpenseInputs}
              totalBudgeted={calculatedTotalBudgeted}
              showTimelineCharts={true}
              showTrendTab={false}
              showBurndownTab={false}
              showCashFlowTab={true}
            />
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
