"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/utils/formatMoney";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  PieChart,
  ArrowUpCircle,
  ArrowDownCircle,
  Trash2,
} from "lucide-react";
import { SpendingChart } from "@/components/ui/SpendingChart";
import { useMonthlyBudgets, useUserId, useDeleteMonthlyBudget, useExpenses, useCategories } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";


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

export default function BudgetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const budgetId = params.id as string;
  
  const { data: userId } = useUserId();
  const { data: budgets = [], isLoading: budgetsLoading } = useMonthlyBudgets(
    userId || ""
  );
  const { data: expenses = [] } = useExpenses(userId || "");
  const { data: categories = [] } = useCategories(userId || "");
  const deleteBudgetMutation = useDeleteMonthlyBudget();

  const selectedBudget = budgets.find((b) => b._id === budgetId);

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId);
      router.push("/history");
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  // Calculate spent for each category from expenses (like main app)
  const categoriesWithSpent = selectedBudget?.categories.map((category) => {
    const spent = expenses
      .filter((exp) => {
        // Find the category by ID and then match by name
        const categoryObj = categories.find(cat => cat._id === exp.categoryId);
        return categoryObj?.name === category.name;
      })
      .reduce((sum, exp) => {
        if (exp.type === "expense") return sum + exp.amount;
        if (exp.type === "income") return sum - exp.amount;
        return sum;
      }, 0);
    return { ...category, spent };
  }) || [];

  // Get top spending categories for chart
  const chartCategories = [...categoriesWithSpent]
    .filter(cat => cat.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent) // Sort by spent amount (highest first)
    .slice(0, 8); // Show top 8 spending categories

  const chartData = chartCategories.map((category) => ({
    name: category.name,
    spent: Number(category.spent) || 0,
    budgeted: Number(category.budgeted) || 0,
    overBudget: (Number(category.spent) || 0) > (Number(category.budgeted) || 0),
  }));

  const hasSpendingData = selectedBudget && selectedBudget.categories.length > 0;



  if (budgetsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/history"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to History
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
        </main>
      </div>
    );
  }

  if (!selectedBudget) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/history"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to History
                </Link>
                <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Budget not found. It may have been deleted.
            </p>
            <Button onClick={() => router.push("/history")} className="mt-4">
              Back to History
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/history"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to History
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Budget Details</h1>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this budget? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-background to-primary/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  Budget Overview
                </CardTitle>
                <CardDescription className="text-base">
                  {selectedBudget.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Budgeted
                    </span>
                    <span className="font-medium">
                      {formatMoney(selectedBudget.totalBudgeted)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-medium">
                      {formatMoney(selectedBudget.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Difference</span>
                    <span
                      className={`font-medium ${
                        selectedBudget.totalBudgeted -
                          selectedBudget.totalSpent >=
                        0
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {formatMoney(
                        selectedBudget.totalBudgeted -
                          selectedBudget.totalSpent
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-background to-secondary/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <ArrowDownCircle className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  Transactions
                </CardTitle>
                <CardDescription className="text-base">Total transactions for the month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {selectedBudget.expensesCount}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Transactions recorded
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="border-b bg-gradient-to-r from-background to-destructive/5">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <ArrowUpCircle className="h-5 w-5 text-destructive" />
                  </div>
                  Categories
                </CardTitle>
                <CardDescription className="text-base">
                  Budget categories used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">
                  {selectedBudget.categories.length}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Categories tracked
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Spending Chart */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                Category Spending
              </CardTitle>
              <CardDescription className="text-base">
                Comparison of budgeted vs actual spending by category
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[450px] flex flex-col">
                {hasSpendingData ? (
                  <div className="flex-1 overflow-x-auto rounded-lg">
                    <div className="min-w-full h-full p-4" style={{ minWidth: `${Math.max(chartCategories.length * 140, 500)}px` }}>
                      <SpendingChart 
                        data={chartData}
                        showBudgeted={true}
                        showLegend={false}
                        height="100%"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-foreground">
                          {selectedBudget?.categories.length === 0 
                            ? "No Categories Available" 
                            : "No Spending Data Available"
                          }
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {selectedBudget?.categories.length === 0 
                            ? "No budget categories were tracked for this period. Add categories to see spending breakdown." 
                            : "No expenses were recorded for this period. Start tracking expenses to see your spending patterns."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-background to-muted/20">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <TrendingUp className="h-6 w-6 text-secondary-foreground" />
                </div>
                Category Details
              </CardTitle>
              <CardDescription className="text-base">
                Detailed breakdown of each category
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {selectedBudget.categories.map((category, index) => (
                  <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ 
                          backgroundColor: index === 0 ? '#60A5FA' : 
                                        index === 1 ? '#34D399' : 
                                        index === 2 ? '#FBBF24' : 
                                        index === 3 ? '#F87171' : 
                                        index === 4 ? '#A78BFA' : 
                                        index === 5 ? '#F472B6' : 
                                        index === 6 ? '#34D399' : '#F59E0B'
                        }}></div>
                        <span className="font-semibold text-lg">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          category.spent > category.budgeted ? "text-destructive" : "text-primary"
                        }`}>
                          {formatMoney(category.spent)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          of {formatMoney(category.budgeted)} budgeted
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
                              (category.spent / category.budgeted) * 100
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {Math.round((category.spent / category.budgeted) * 100)}% spent
                        </span>
                        <span className={`font-medium ${
                          category.spent > category.budgeted ? "text-destructive" : "text-primary"
                        }`}>
                          {category.spent > category.budgeted 
                            ? `+${formatMoney(category.spent - category.budgeted)} over`
                            : `${formatMoney(category.budgeted - category.spent)} remaining`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 