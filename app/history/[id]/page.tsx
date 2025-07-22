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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getChartColor, useThemeColors } from "@/lib/theme";
import { useMonthlyBudgets, useUserId, useDeleteMonthlyBudget } from "@/lib/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
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
  const deleteBudgetMutation = useDeleteMonthlyBudget();

  const selectedBudget = budgets.find((b) => b._id === budgetId);
  const themeColors = useThemeColors();

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteBudgetMutation.mutateAsync(budgetId);
      router.push("/history");
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  // Prepare data for chart (same as Summary component)
  const chartCategories = selectedBudget?.categories
    .filter(cat => cat.spent > 0) // Only show categories with spending
    .sort((a, b) => b.spent - a.spent) // Sort by spent amount (highest first)
    .slice(0, 8) || []; // Show top 8 spending categories

  const chartData = chartCategories.map((category, index) => ({
    name: category.name,
    spent: category.spent,
    budgeted: category.budgeted,
    overBudget: category.spent > category.budgeted,
  }));

  const hasSpendingData = chartCategories.length > 0;

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Budget Overview
                </CardTitle>
                <CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownCircle className="h-5 w-5 text-primary" />
                  Transactions
                </CardTitle>
                <CardDescription>Total transactions for the month</CardDescription>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5 text-destructive" />
                  Categories
                </CardTitle>
                <CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Category Spending
              </CardTitle>
              <CardDescription>
                Comparison of budgeted vs actual spending by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex flex-col">
                {hasSpendingData ? (
                  <div className="flex-1 overflow-x-auto">
                    <div className="min-w-full h-full" style={{ minWidth: `${Math.max(chartCategories.length * 120, 400)}px` }}>
                      <Bar
                        data={{
                          labels: chartData.map(item => item.name),
                          datasets: [
                            {
                              label: 'Spent',
                              data: chartData.map(item => item.spent),
                              backgroundColor: chartData.map((item, index) => 
                                item.overBudget 
                                  ? themeColors.destructive
                                  : getChartColor(index)
                              ),
                              borderColor: chartData.map((item, index) => 
                                item.overBudget 
                                  ? themeColors.destructive
                                  : getChartColor(index)
                              ),
                              borderWidth: 1,
                              borderRadius: 6,
                              borderSkipped: false,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false, // Hide legend since we only have one dataset
                            },
                            tooltip: {
                              backgroundColor: themeColors.popover,
                              titleColor: themeColors.foreground,
                              bodyColor: themeColors.foreground,
                              borderColor: themeColors.border,
                              borderWidth: 1,
                              cornerRadius: 8,
                              displayColors: true,
                              titleFont: {
                                size: 14,
                                weight: 'bold',
                              },
                              bodyFont: {
                                size: 12,
                              },
                              callbacks: {
                                label: function(context) {
                                  const label = context.dataset.label || '';
                                  const value = context.parsed.y;
                                  return `${label}: ${formatMoney(value)}`;
                                },
                              },
                            },
                          },
                          scales: {
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: themeColors.muted,
                                font: {
                                  size: chartCategories.length > 6 ? 10 : 12,
                                  weight: 'normal',
                                },
                                maxRotation: 45,
                                minRotation: 0,
                                autoSkip: true,
                                maxTicksLimit: chartCategories.length > 6 ? 6 : 8,
                              },
                              border: {
                                color: themeColors.border,
                              },
                            },
                            y: {
                              grid: {
                                color: `${themeColors.muted}20`,
                              },
                              ticks: {
                                color: themeColors.muted,
                                font: {
                                  size: 11,
                                  weight: 'normal',
                                },
                                callback: function(value) {
                                  return formatMoney(value as number);
                                },
                              },
                              border: {
                                color: themeColors.border,
                              },
                            },
                          },
                          interaction: {
                            intersect: false,
                            mode: 'index' as const,
                          },
                          animation: {
                            duration: 750,
                            easing: 'easeInOutQuart',
                          },
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedBudget?.categories.length === 0 
                          ? "No categories available" 
                          : "No spending data available"
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedBudget?.categories.length === 0 
                          ? "No budget categories were tracked" 
                          : "No expenses were recorded for this period"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>
                Detailed breakdown of each category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedBudget.categories.map((category, index) => (
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
                        {formatMoney(category.spent)}
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
                      <span>Budgeted: {formatMoney(category.budgeted)}</span>
                      <span>
                        {Math.round(
                          (category.spent / category.budgeted) * 100
                        )}
                        % spent
                      </span>
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