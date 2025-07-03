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
import { Plus, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BudgetSectionItem from "./BudgetSectionItem";
import NewSectionForm from "./NewSectionForm";
import { formatMoney } from "@/lib/utils/formatMoney";
import { toast } from "sonner";
import { currencies, Currency } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import {
  useUserId,
  useCreateBudget,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateBudget,
} from "@/lib/hooks";
import { LoadingButton } from "@/components/ui/loading-skeleton";
import { useExpenses } from "@/lib/hooks/useExpenseQueries";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

interface Section {
  _id?: string;
  id?: string;
  name: string;
  amount: number;
}

interface Budget {
  _id: string;
  sections: Section[];
  totalBudgeted: number;
  totalAvailable: number;
}

interface BudgetSetupSectionProps {
  budget: Budget | null;
  categories: Category[];
}

const BudgetSetupSection: React.FC<BudgetSetupSectionProps> = ({
  budget,
  categories,
}) => {
  const { data: session } = useSession();
  const { data: userId } = useUserId();
  const { data: expenses = [] } = useExpenses(userId || "");

  // React Query mutations
  const createBudgetMutation = useCreateBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const updateBudgetMutation = useUpdateBudget();

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const currency: Currency = currencies[0]; // Default to USD, or fetch from user/session if needed
  const [newTotal, setNewTotal] = useState("");
  const [newMonth, setNewMonth] = useState("January");
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  // Month names array
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Convert month name to number
  const getMonthNumber = (monthName: string) => {
    return months.indexOf(monthName) + 1;
  };

  // Calculate spent for each category
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

  // Category CRUD handlers
  const handleAddCategory = async (
    sectionId: string,
    name: string,
    budgeted: number
  ) => {
    if (!userId) return;

    try {
      await createCategoryMutation.mutateAsync({
        name,
        budgeted,
        sectionId,
        userId,
      });

      // Update budget totals
      if (budget) {
        const updatedBudget = {
          ...budget,
          totalBudgeted: budget.totalBudgeted + budgeted,
          totalAvailable: budget.totalAvailable - budgeted,
        };

        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: updatedBudget,
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      const category = categories.find(
        (c) => c._id === categoryId || c.id === categoryId
      );
      if (!category) return;

      await deleteCategoryMutation.mutateAsync(categoryId);

      // Update budget totals
      if (budget) {
        const updatedBudget = {
          ...budget,
          totalBudgeted: budget.totalBudgeted - category.budgeted,
          totalAvailable: budget.totalAvailable + category.budgeted,
        };

        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: updatedBudget,
        });
      }
    } catch (error) {
      console.error("Error removing category:", error);
    }
  };

  const handleUpdateCategory = async (
    categoryId: string,
    name: string,
    budgeted: number
  ) => {
    try {
      const category = categories.find(
        (c) => c._id === categoryId || c.id === categoryId
      );
      if (!category) return;

      const budgetDiff = budgeted - category.budgeted;

      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        updates: { name, budgeted },
      });

      // Update budget totals if budgeted amount changed
      if (budget && budgetDiff !== 0) {
        const updatedBudget = {
          ...budget,
          totalBudgeted: budget.totalBudgeted + budgetDiff,
          totalAvailable: budget.totalAvailable - budgetDiff,
        };

        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: updatedBudget,
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Update total budget
  const handleSetTotalBudget = async () => {
    if (!budget) return;
    const amount = parseFloat(totalBudget);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount < budget.totalBudgeted) {
      toast.error("New total cannot be less than currently budgeted amount");
      return;
    }

    await updateBudgetMutation.mutateAsync({
      id: budget._id,
      updates: {
        ...budget,
        totalAvailable: amount - budget.totalBudgeted,
      },
    });

    setIsEditingTotal(false);
    setTotalBudget("");
  };

  // Add a new section
  const handleAddSection = async (name: string) => {
    if (!budget) return;
    const newSection = { name, amount: 0 };
    const updatedSections = [...budget.sections, newSection];

    await updateBudgetMutation.mutateAsync({
      id: budget._id,
      updates: {
        ...budget,
        sections: updatedSections,
      },
    });

    setIsAddingSection(false);
  };

  // Remove a section
  const handleRemoveSection = async (sectionName: string) => {
    if (!budget) return;
    const section = budget.sections.find((s) => s.name === sectionName);
    if (!section) return;
    const updatedSections = budget.sections.filter(
      (s) => s.name !== sectionName
    );

    await updateBudgetMutation.mutateAsync({
      id: budget._id,
      updates: {
        ...budget,
        sections: updatedSections,
      },
    });
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(newTotal);
    if (isNaN(total) || total <= 0) {
      toast.error("Please enter a valid total budget");
      return;
    }
    if (!userId) {
      toast.error("You must be signed in to create a budget");
      return;
    }

    // Convert month name to number (1-based)
    const monthNumber = getMonthNumber(newMonth);

    await createBudgetMutation.mutateAsync({
      month: monthNumber,
      year: newYear,
      totalBudgeted: total,
      totalAvailable: total,
      user: userId,
    });
  };

  if (!session) return <div>Please sign in to manage your budget.</div>;

  // Debug: log budget value
  console.log("budget", budget);

  // Show create form if no budget
  if (!budget) {
    return (
      <Card className="glass-card hover-card max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Create Your Budget</CardTitle>
          <CardDescription>
            Set your total budget, month, and year to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBudget} className="space-y-4">
            <Input
              type="number"
              placeholder="Total Budget"
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              min={0}
              step="0.01"
              required
            />
            <div className="flex gap-2">
              <Select value={newMonth} onValueChange={setNewMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Year"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                min={2000}
                max={2100}
                required
              />
            </div>
            <LoadingButton
              type="submit"
              className="w-full"
              loading={createBudgetMutation.isPending}
            >
              Create Budget
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Only render budget UI if budget exists
  return (
    <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div>
            <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Budget Setup
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-slate-700 dark:text-white/70">
              Create budget sections and categories to track your spending
            </CardDescription>
          </div>
          <div className="text-right">
            {isEditingTotal ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="Total budget"
                    className="w-full sm:w-40 pl-9"
                    min={budget?.totalBudgeted}
                    step="0.01"
                  />
                </div>
                <div className="flex gap-2">
                  <LoadingButton
                    size="sm"
                    onClick={handleSetTotalBudget}
                    className="flex-1 sm:flex-none"
                    loading={updateBudgetMutation.isPending}
                  >
                    Set
                  </LoadingButton>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTotal(false)}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTotal(true)}
                className="p-3 rounded-lg bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 dark:hover:bg-white/20 transition-all duration-200 cursor-pointer border border-slate-900/20 dark:border-white/20"
              >
                <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
                  {formatMoney(
                    (budget?.totalBudgeted || 0) +
                      (budget?.totalAvailable || 0),
                    currency
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
                  Total Budget (click to edit)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              Budgeted
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(budget?.totalBudgeted || 0, currency)}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              Available to Budget
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(budget?.totalAvailable || 0, currency)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {budget && budget.sections.length > 0 ? (
            <div className="space-y-4">
              {budget.sections.map((section) => (
                <BudgetSectionItem
                  key={section._id || section.name}
                  section={section}
                  categories={categoriesWithSpent}
                  onRemove={handleRemoveSection}
                  onAddCategory={handleAddCategory}
                  onRemoveCategory={handleRemoveCategory}
                  onUpdateCategory={handleUpdateCategory}
                  totalAvailable={budget.totalAvailable}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-slate-900/5 dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/20 dark:bg-white/20 mb-3 sm:mb-4">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-white" />
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                No budget sections yet. Add one to get started.
              </p>
            </div>
          )}

          {isAddingSection ? (
            <NewSectionForm
              onComplete={(name: string) => handleAddSection(name)}
              onCancel={() => setIsAddingSection(false)}
            />
          ) : (
            <Button
              onClick={() => setIsAddingSection(true)}
              className="w-full mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Section
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetSetupSection;
