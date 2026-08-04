"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormatMoney } from "@/lib/hooks/useFormatMoney";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMonthlyBudgets, useUserId, useExpenses, useCategories, useCurrentDecimalSeparator } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import MobileHeader from "@/components/MobileHeader";
import { useTranslation } from "@/lib/i18n";
import { getHistoryBasePath } from "@/lib/budget-routes";

function InsightsContent() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const historyBase = getHistoryBasePath(pathname);
  const { data: userId } = useUserId();
  const decimalSeparator = useCurrentDecimalSeparator();
  const { formatAmount, isPrivateMode } = useFormatMoney();
  const { data: budgets = [], isLoading: budgetsLoading, refetch: refetchBudgets } = useMonthlyBudgets(
    userId || ""
  );

  // Force refetch if budgets is empty but userId is available
  useEffect(() => {
    if (userId && budgets.length === 0 && !budgetsLoading) {
      refetchBudgets();
    }
  }, [userId, budgets.length, budgetsLoading, refetchBudgets]);
  const searchParams = useSearchParams();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>("");

  // Set initial budget from URL parameter or first available budget
  useEffect(() => {
    const budgetFromUrl = searchParams.get('budget');
    if (budgetFromUrl && budgets.length > 0) {
      setSelectedBudgetId(budgetFromUrl);
    } else if (budgets.length > 0 && !selectedBudgetId) {
      setSelectedBudgetId(budgets[0]._id);
    }
  }, [budgets, searchParams, selectedBudgetId]);

  const selectedBudget = budgets.find((b) => b._id === selectedBudgetId);

  // Fetch all expenses and categories for the user
  const { data: allExpenses = [] } = useExpenses(userId || "");
  const { data: allCategories = [] } = useCategories(userId || "");

  // Enhanced debug logging


  // Filter expenses for the selected month/year
  const selectedMonth = selectedBudget?.month;
  const selectedYear = selectedBudget?.year;
  

  
  const filteredExpenses = allExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    const expMonth = expDate.getMonth() + 1; // 1-based month
    const expYear = expDate.getFullYear();
    
    // Convert month name to number
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const selectedMonthNumber = selectedMonth ? monthNames.indexOf(selectedMonth) + 1 : 0;
    
    const matchesMonth = expMonth === selectedMonthNumber;
    const matchesYear = expYear === selectedYear;
    
    
    
    return matchesMonth && matchesYear;
  });
  


  // Calculate spent for each category using a more robust approach
  const categoriesWithSpent = (selectedBudget?.categories || []).map(
    (monthlyCategory) => {

      
      // Try multiple matching strategies
      let categoryExpenses = [];
      
      // Strategy 1: Find actual category by name and match by ID
      const actualCategory = allCategories.find((cat) => 
        cat.name.toLowerCase() === monthlyCategory.name.toLowerCase()
      );
      
      if (actualCategory) {
        
        categoryExpenses = filteredExpenses.filter((exp) => 
          exp.categoryId === actualCategory._id
        );
      } else {
        
        // Strategy 2: Direct name matching (fallback)
        categoryExpenses = filteredExpenses.filter((exp) => {
          // Find the category name for this expense
          const expenseCategory = allCategories.find(cat => cat._id === exp.categoryId);
          return expenseCategory && expenseCategory.name.toLowerCase() === monthlyCategory.name.toLowerCase();
        });
      }

      // Use the monthly budget's own spent data if no expenses found
      const spentFromExpenses = categoryExpenses.reduce((sum, exp) => {
        if (exp.type === "expense") return sum + exp.amount;
        if (exp.type === "income") return sum - exp.amount;
        return sum;
      }, 0);

      // Fallback to monthly budget's own data if no expenses found
      const spent = filteredExpenses.length > 0 ? spentFromExpenses : monthlyCategory.spent;



      return { ...monthlyCategory, spent };
    }
  );

  // Prepare data for category comparison chart
  const categoryData = categoriesWithSpent.map((category) => ({
    name: category.name,
    budgeted: category.budgeted,
    spent: category.spent,
    overBudget: category.spent > category.budgeted,
  }));

  // Calculate income and expense totals from filtered expenses
  const incomeTotal = filteredExpenses
    .filter(exp => exp.type === "income")
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const expenseTotal = filteredExpenses
    .filter(exp => exp.type === "expense")
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Fallback to monthly budget's total spent if no expenses found
  const finalExpenseTotal = filteredExpenses.length > 0 ? expenseTotal : selectedBudget?.totalSpent || 0;

  // Get top spending categories
  const topCategories = [...categoriesWithSpent]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-sm text-muted-foreground">
            Spent:{" "}
            <span className="font-medium text-foreground">
              {formatAmount(data.spent, undefined, decimalSeparator)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Budgeted:{" "}
            <span className="font-medium text-foreground">
              {formatAmount(data.budgeted, undefined, decimalSeparator)}
            </span>
          </p>
        </div>
      );
    }
    return null;
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
              <h1 className="text-xl sm:text-2xl font-bold">{t("budgetInsights")}</h1>
            </div>

            <Select
              value={selectedBudgetId}
              onValueChange={setSelectedBudgetId}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("selectAMonth")} />
              </SelectTrigger>
              <SelectContent>
                {budgets.map((budget) => (
                  <SelectItem key={budget._id} value={budget._id}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20 md:pb-8">
        {budgetsLoading ? (
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
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
        ) : selectedBudget ? (
                      <div className="space-y-6">
              {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t("budgetOverview")}
                  </CardTitle>
                  <CardDescription>
                    {format(parseISO(selectedBudget.createdAt), "MMMM yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("totalBudgeted")}
                      </span>
                      <span className="font-medium">
                        {formatAmount(selectedBudget.totalBudgeted, undefined, decimalSeparator)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("totalSpent")}</span>
                      <span className="font-medium">
                        {formatAmount(selectedBudget.totalSpent, undefined, decimalSeparator)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">{t("difference")}</span>
                      <span
                        className={`font-medium ${
                          selectedBudget.totalBudgeted -
                            selectedBudget.totalSpent >=
                          0
                            ? "text-success"
                            : "text-destructive"
                        }`}
                      >
                        {formatAmount(
                          selectedBudget.totalBudgeted -
                            selectedBudget.totalSpent,
                          undefined,
                          decimalSeparator
                        )}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownCircle className="h-5 w-5 text-success" />
                    {t("income")}
                  </CardTitle>
                  <CardDescription>{t("totalIncomeForMonth")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {formatAmount(incomeTotal, undefined, decimalSeparator)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("totalIncomeForMonth")} — {format(parseISO(selectedBudget.createdAt), "MMMM yyyy")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowUpCircle className="h-5 w-5 text-destructive" />
                    {t("expenses")}
                  </CardTitle>
                  <CardDescription>
                    {t("totalExpensesForMonth")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {formatAmount(finalExpenseTotal, undefined, decimalSeparator)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {t("totalExpensesForMonth")} — {format(parseISO(selectedBudget.createdAt), "MMMM yyyy")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  {t("categorySpending")}
                </CardTitle>
                <CardDescription>
                  {t("categorySpendingDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryData}
                      margin={{
                        top: 24,
                        right: 24,
                        left: 20,
                        bottom: 24,
                      }}
                      barGap={12}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--muted-foreground)/0.15)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={60}
                        textAnchor="middle"
                      />
                      <YAxis
                        tickFormatter={(value) => formatAmount(value, undefined, decimalSeparator)}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={80}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: "hsl(var(--muted)/0.2)" }}
                      />
                      <Bar
                        dataKey="budgeted"
                        fill="hsl(var(--muted))"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={48}
                      />
                      <Bar
                        dataKey="spent"
                        radius={[10, 10, 0, 0]}
                        maxBarSize={48}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.overBudget
                                ? "hsl(var(--destructive))"
                                : "hsl(var(--primary))"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>{t("topSpendingCategories")}</CardTitle>
                <CardDescription>
                  {t("topCategoriesDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category.name}</span>
                        <span
                          className={
                            category.spent > category.budgeted
                              ? "text-destructive"
                              : ""
                          }
                        >
                          {formatAmount(category.spent, undefined, decimalSeparator)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            category.spent > category.budgeted
                              ? "bg-destructive"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (category.spent / category.budgeted) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{t("budgeted")}: {formatAmount(category.budgeted, undefined, decimalSeparator)}</span>
                        <span>
                          {Math.round(
                            (category.spent / category.budgeted) * 100
                          )}
                          {t("percentSpent")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t("noInsightsYet")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  );
}
