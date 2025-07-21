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
import { Plus, DollarSign, Trash2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { currencies, type Currency } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import {
  useUserId,
  useCreateBudget,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateBudget,
  useDeleteBudget,
} from "@/lib/hooks";
import { useAIBudgetCreation } from "@/lib/hooks/useAIBudgetCreation";
import { LoadingButton } from "@/components/ui/loading-skeleton";
import { useExpenses } from "@/lib/hooks/useExpenseQueries";
import type { Budget } from "@/lib/api";
import { AILoading } from "@/components/ui/ai-loading";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

interface BudgetSetupSectionProps {
  budget: Budget | null;
  categories: Category[];
}

const BudgetSetupSection: React.FC<BudgetSetupSectionProps> = ({
  budget,
  categories,
}) => {
  const { data: session } = useSession();
  const {
    data: userId,
    isLoading: userIdLoading,
    error: userIdError,
  } = useUserId();
  const { data: expenses = [] } = useExpenses(userId || "");

  // React Query mutations
  const createBudgetMutation = useCreateBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const currency: Currency = currencies[0]; // Default to USD, or fetch from user/session if needed
  const [newTotal, setNewTotal] = useState("");
  const [newMonth, setNewMonth] = useState("January");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  
  // AI Budget Creation
  const [aiDescription, setAiDescription] = useState("");
  const { createBudgetFromAI, isProcessing: isAICreating, currentStep } = useAIBudgetCreation();

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

  // Calculate total budgeted from categories (this should match database totalBudgeted)
  const calculatedTotalBudgeted = categories.reduce(
    (sum, cat) => sum + cat.budgeted,
    0
  );

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

    const currentTotal =
      (budget.totalBudgeted || 0) + (budget.totalAvailable || 0);
    const currentlyBudgeted = budget.totalBudgeted || 0;

    if (amount < currentlyBudgeted) {
      toast.error("New total cannot be less than currently budgeted amount");
      return;
    }

    await updateBudgetMutation.mutateAsync({
      id: budget._id,
      updates: {
        ...budget,
        totalBudgeted: currentlyBudgeted, // Keep currently budgeted amount
        totalAvailable: amount - currentlyBudgeted, // Adjust available amount
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
      console.error("No userId available:", {
        session,
        userId,
        userIdLoading,
        userIdError,
      });
      toast.error("You must be signed in to create a budget");
      return;
    }

    console.log("Creating budget with userId:", userId);

    // Convert month name to number (1-based)
    const monthNumber = getMonthNumber(newMonth);

    try {
      await createBudgetMutation.mutateAsync({
        month: monthNumber,
        year: newYear,
        totalBudgeted: 0, // Start with 0 budgeted to categories
        totalAvailable: total, // All amount is available to budget
        user: userId,
      });
      console.log("Budget created successfully");
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast.error("Failed to create budget. Please try again.");
    }
  };

  const handleCreateBudgetWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiDescription.trim()) {
      toast.error("Please enter a budget description");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to create a budget");
      return;
    }

    try {
      const monthNumber = getMonthNumber(newMonth);
      await createBudgetFromAI(aiDescription, monthNumber, newYear);
      
      toast.success("Budget created successfully with AI!");
      setAiDescription("");
    } catch (error) {
      console.error("Failed to create budget with AI:", error);
      toast.error("Failed to create budget with AI. Please try again.");
    }
  };

  const handleDeleteBudget = async () => {
    if (!budget?._id) return;

    try {
      await deleteBudgetMutation.mutateAsync(budget._id);
      console.log("Budget deleted successfully");
    } catch (error) {
      console.error("Failed to delete budget:", error);
      toast.error("Failed to delete budget. Please try again.");
    }
  };

  if (!session) return <div>Please sign in to manage your budget.</div>;

  // Show loading state while fetching userId
  if (userIdLoading) {
    return (
      <Card className="glass-card hover-card max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we load your account information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state if userId fetch failed
  if (userIdError) {
    return (
      <Card className="glass-card hover-card max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to load your account information. Please try refreshing the
            page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Error: {userIdError.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Debug: log budget value
  console.log("budget", budget);

  // Show create form if no budget
  if (!budget) {
    return (
      <>
        <AILoading isProcessing={isAICreating} currentStep={currentStep} />
        <Card className="glass-card hover-card max-w-2xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Create Your Budget</CardTitle>
          <CardDescription>
            Choose how you'd like to create your budget - manually or with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="text-sm font-medium">
                Manual Setup
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4 mt-4">
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
                  className="w-full btn-primary flex items-center justify-center"
                  loading={createBudgetMutation.isPending}
                >
                  Create Budget
                </LoadingButton>
              </form>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4 mt-4">
              <form onSubmit={handleCreateBudgetWithAI} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="aiDescription" className="text-sm font-medium text-white">
                    Describe your budget
                  </label>
                  <Textarea
                    id="aiDescription"
                    placeholder="Example: I make 5000. Rent 2000, food 1000, the rest is savings."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    rows={4}
                    disabled={isAICreating}
                  />
                </div>
                
                <div className="text-sm text-white/70">
                  <p className="font-medium mb-2">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-white/60">
                    <li>"I make 5000. Rent 2000, food 1000, the rest is savings."</li>
                    <li>"My income is 3000. I spend 1200 on rent, 800 on food, 300 on transport, and save the rest."</li>
                    <li>"I earn 6000 monthly. 2500 for rent, 1000 for food, 500 for utilities, and the rest goes to savings."</li>
                  </ul>
                </div>
                
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
                  className="w-full btn-primary flex items-center justify-center"
                  loading={isAICreating}
                  disabled={!aiDescription.trim()}
                >
                  {isAICreating ? (
                    "Creating budget with AI..."
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                      Create Budget with AI
                    </>
                  )}
                </LoadingButton>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </>
    );
  }

  // Only render budget UI if budget exists
  return (
    <>
      <AILoading isProcessing={isAICreating} currentStep={currentStep} />
      <Card className="glass-card hover-card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
          <div className="flex items-start justify-between w-full sm:w-auto">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Budget Setup
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                Create budget sections and categories to track your spending
              </CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this budget? This will remove all categories, sections, and expenses. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteBudget}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Budget
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                    calculatedTotalBudgeted + (budget?.totalAvailable || 0),
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
              {formatMoney(calculatedTotalBudgeted, currency)}
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
    </>
  );
};

export default BudgetSetupSection;
