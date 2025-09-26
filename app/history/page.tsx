"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/utils/formatMoney";
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
} from "@/lib/hooks";
import { HistoryItemSkeleton } from "@/components/ui/loading-skeleton";
import MobileHeader from "@/components/MobileHeader";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: userId } = useUserId();
  const { data: budgets = [], isLoading: budgetsLoading } = useMonthlyBudgets(
    userId || ""
  );
  const deleteBudgetMutation = useDeleteMonthlyBudget();

  const sortedBudgets = [...budgets].sort(
    (a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()
  );

  const filteredBudgets = sortedBudgets.filter((budget) =>
    budget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteBudgetMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Budget history deleted successfully");
      },
      onError: (error) => {
        console.error("Error deleting budget:", error);
        toast.error("Failed to delete budget history");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <MobileHeader title="Budget History" />
      
      {/* Desktop Header */}
      <header className="hidden md:block border-b bg-card/90 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/budget"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Budget
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold">Budget History</h1>
            </div>

            <Link href="/history/insights">
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                View Insights
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search budget history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
                <Card key={budget._id} className="glass-card hover-card cursor-pointer transition-all duration-200 hover:scale-[1.02]" onClick={() => window.location.href = `/history/${budget._id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{budget.name}</CardTitle>
                        <CardDescription>
                          {format(parseISO(budget.createdAt), "PPP")}
                        </CardDescription>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
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
                              Delete Budget History
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base">
                              Are you sure you want to delete this budget
                              history? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="text-sm sm:text-base">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(budget._id)}
                              className="text-sm sm:text-base"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Total Budgeted
                        </div>
                        <div className="font-medium">
                          {formatMoney(budget.totalBudgeted)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Total Spent
                        </div>
                        <div className="font-medium">
                          {formatMoney(budget.totalSpent)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Categories
                        </div>
                        <div className="font-medium">
                          {budget.categories.length}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          Transactions
                        </div>
                        <div className="font-medium">
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
                    {searchTerm ? "No matching budgets found" : "No budget history yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms."
                      : "Start by resetting your current month to save your first budget snapshot."}
                  </p>
                  {!searchTerm && (
                    <Link href="/budget">
                      <Button>
                        Go to Budget
                      </Button>
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
