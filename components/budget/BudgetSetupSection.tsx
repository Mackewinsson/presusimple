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
import { Plus, DollarSign, Trash2, Sparkles, Zap } from "lucide-react";
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
import { currencies, type Currency, useCurrentCurrency } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import {
  useUserId,
  useCreateBudget,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUpdateBudget,
  useDeleteBudget,
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAIBudgetCreation } from "@/lib/hooks/useAIBudgetCreation";
import { LoadingButton } from "@/components/ui/loading-skeleton";
import { useExpenses } from "@/lib/hooks/useExpenseQueries";
import type { Budget } from "@/lib/api";
import { budgetApi } from "@/lib/api";
import { budgetKeys } from "@/lib/hooks/useBudgetQueries";
import { AILoading } from "@/components/ui/ai-loading";
import { useFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import { UpgradeToProCTA } from "@/components/UpgradeToProCTA";
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
  const { t } = useTranslation();
  const { data: session } = useSession();
  const currentCurrency = useCurrentCurrency();
  const {
    data: userId,
    isLoading: userIdLoading,
    error: userIdError,
  } = useUserId();
  const { data: expenses = [] } = useExpenses(userId || "");

  const queryClient = useQueryClient();
  const featureFlags = useFeatureFlags();
  
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
  const currency: Currency = currentCurrency; // Use selected currency
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
        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: {
            totalBudgeted: budget.totalBudgeted + budgeted,
            totalAvailable: budget.totalAvailable - budgeted,
          },
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
        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: {
            totalBudgeted: budget.totalBudgeted - category.budgeted,
            totalAvailable: budget.totalAvailable + category.budgeted,
          },
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
        await updateBudgetMutation.mutateAsync({
          id: budget._id,
          updates: {
            totalBudgeted: budget.totalBudgeted + budgetDiff,
            totalAvailable: budget.totalAvailable - budgetDiff,
          },
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Update total budget
  const handleSetTotalBudget = async () => {
    if (!budget) return;
    
    console.log("Setting total budget:", {
      inputValue: totalBudget,
      currentBudget: budget,
      currentlyBudgeted: budget.totalBudgeted || 0
    });
    
    const amount = parseFloat(totalBudget);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const currentlyBudgeted = budget.totalBudgeted || 0;

    if (amount < currentlyBudgeted) {
      toast.error("New total cannot be less than currently budgeted amount");
      return;
    }

    const newTotalAvailable = amount - currentlyBudgeted;

    console.log("Updating budget with:", {
      id: budget._id,
      totalBudgeted: currentlyBudgeted,
      totalAvailable: newTotalAvailable
    });

    try {
      await updateBudgetMutation.mutateAsync({
        id: budget._id,
        updates: {
          totalBudgeted: currentlyBudgeted, // Keep currently budgeted amount
          totalAvailable: newTotalAvailable, // Adjust available amount
        },
      });

      console.log("Budget updated successfully");
      setIsEditingTotal(false);
      setTotalBudget("");
    } catch (error) {
      console.error("Failed to update budget:", error);
      toast.error("Failed to update budget. Please try again.");
    }
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

  // Update a section name
  const handleUpdateSection = async (oldSectionName: string, newSectionName: string) => {
    if (!budget) return;
    
    console.log("Starting section update:", { oldSectionName, newSectionName, budgetId: budget._id });
    
    try {
      // Use the atomic section update API
      const result = await budgetApi.updateSectionName(
        budget._id,
        oldSectionName,
        newSectionName
      );
      
      console.log("Section updated successfully:", {
        updatedCategories: result.updatedCategories,
        newBudget: result.budget
      });

      // Update the cache with the new budget data
      queryClient.setQueryData(budgetKeys.detail(budget._id), result.budget);
      
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });

      toast.success("Section name updated successfully");
    } catch (error) {
      console.error("Failed to update section name:", error);
      toast.error("Failed to update section name. Please try again.");
    }
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
      
      // Reset form after successful creation
      setNewTotal("");
      setNewMonth("January");
      setNewYear(new Date().getFullYear());
      
      // Force refetch budget data to show the new budget
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast.error("Failed to create budget. Please try again.");
    }
  };

  const handleCreateBudgetWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Edge case: Validate description length
    if (!aiDescription.trim()) {
      toast.error("Please enter a budget description");
      return;
    }

    if (aiDescription.trim().length < 10) {
      toast.error("Please provide a more detailed description (at least 10 characters)");
      return;
    }

    if (!userId) {
      toast.error("You must be signed in to create a budget");
      return;
    }

    // Edge case: Validate month and year
    const monthNumber = getMonthNumber(newMonth);
    if (monthNumber < 1 || monthNumber > 12) {
      toast.error("Please select a valid month");
      return;
    }

    if (newYear < 2020 || newYear > 2030) {
      toast.error("Please select a valid year (2020-2030)");
      return;
    }

    try {
      await createBudgetFromAI(aiDescription, monthNumber, newYear);
      
      toast.success("Budget created successfully with AI!");
      setAiDescription("");
      
      // Force refetch budget data to show the new budget
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error) {
      console.error("Failed to create budget with AI:", error);
      
      // Edge case: Show user-friendly error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create budget with AI. Please try again.");
      }
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
        <Card className="glass-card hover-card group bg-gradient-to-br from-white via-purple-50/50 to-white dark:from-slate-900/90 dark:via-purple-900/20 dark:to-slate-900/90 border border-purple-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <Sparkles className="h-6 w-6 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping" />
            </div>
            <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text font-bold">
              Create Your Budget
            </span>
            <Zap className="h-5 w-5 text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text animate-bounce" />
          </CardTitle>
          <CardDescription className="text-base">
            Choose how you'd like to create your budget - manually or with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className={`grid w-full ${featureFlags.hasFeatureAccess("aiBudgeting") ? "grid-cols-2" : "grid-cols-1"}`}>
              <TabsTrigger value="manual" className="text-sm font-medium">
                Manual Setup
              </TabsTrigger>
              {featureFlags.hasFeatureAccess("aiBudgeting") && (
                <TabsTrigger value="ai" className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border-purple-500/30 data-[state=active]:from-purple-600/40 data-[state=active]:to-pink-600/40 data-[state=active]:border-purple-500/50 transition-all duration-200">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text" />
                  AI Assistant
                </TabsTrigger>
              )}
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
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span className="animate-pulse">Creating budget...</span>
                </>
              ) : (
                "Create Budget"
              )}
            </Button>
          </form>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4 mt-4">
              {featureFlags.hasFeatureAccess("aiBudgeting") ? (
                <form onSubmit={handleCreateBudgetWithAI} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="aiDescription" className="text-sm font-medium text-foreground">
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
                                   <div className="flex justify-between items-center text-xs text-muted-foreground">
                                     <span>
                                       {aiDescription.length}/1000 characters
                                     </span>
                                     <span>
                                       {aiDescription.length < 10 ? 'Need more detail' : 'Good description'}
                                     </span>
                                   </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2 text-foreground">Examples:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
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
                
                                                                 <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
                  disabled={!aiDescription.trim() || isAICreating}
                >
                  {isAICreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      <span className="animate-pulse">Creating budget with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                      Create Budget with AI
                    </>
                  )}
                </Button>
              </form>
              ) : (
                <UpgradeToProCTA feature="aiBudgeting" />
              )}
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
                {t('budgetSetup')}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                {t('createBudgetSections')}
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
                onClick={() => {
                  setIsEditingTotal(true);
                  setTotalBudget((calculatedTotalBudgeted + (budget?.totalAvailable || 0)).toString());
                }}
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
                  onUpdateSection={handleUpdateSection}
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
                {t('noBudgetSections')}
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
              {t('addBudgetSection')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default BudgetSetupSection;
