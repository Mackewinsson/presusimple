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
import { Plus, Trash2, Sparkles, Zap } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMoney, parseDecimalInput } from "@/lib/utils/formatMoney";
import { toast } from "sonner";
import { currencies, type Currency, useCurrentCurrency, useCurrentDecimalSeparator } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";
import {
  useUserId,
  useCreateBudget,
  useCreateCategory,
  useUpdateCategory,
  useReorderCategories,
  useDeleteCategory,
  useUpdateBudget,
  useDeleteBudget,
} from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAIBudgetCreation } from "@/lib/hooks/useAIBudgetCreation";
import { LoadingButton } from "@/components/ui/loading-skeleton";
import { useExpenses } from "@/lib/hooks/useExpenseQueries";
import NotificationPrompt from "@/components/NotificationPrompt";
import type { Budget } from "@/lib/api";
import { budgetApi } from "@/lib/api";
import { budgetKeys } from "@/lib/hooks/useBudgetQueries";
import { categoryKeys } from "@/lib/hooks/useCategoryQueries";
import BudgetCategoryItem from "./BudgetCategoryItem";
import NewCategoryForm from "./NewCategoryForm";
import { hasDuplicateName } from "@/lib/utils/normalizeName";
import { AILoading } from "@/components/ui/ai-loading";
import { useFeatureFlags as usePlanFeatureFlags } from "@/lib/hooks/useFeatureFlags";
import { useFeatureFlags as useRemoteFeatureFlags } from "@/hooks/useFeatureFlags";
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
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  budgeted: number;
  spent: number;
  budgetId: string;
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
  const decimalSeparator = useCurrentDecimalSeparator();
  const {
    data: userId,
    isLoading: userIdLoading,
    error: userIdError,
  } = useUserId();
  const { data: expenses = [] } = useExpenses(userId || "");

  const queryClient = useQueryClient();
  const planFeatureFlags = usePlanFeatureFlags();
  const remoteFeatureFlags = useRemoteFeatureFlags();
  const isAIFeatureFlagEnabled = remoteFeatureFlags.isFeatureEnabled("aa");
  const canAccessAIBudgeting = planFeatureFlags.hasFeatureAccess("aiBudgeting");
  const showAIBudgetCreation = isAIFeatureFlagEnabled && canAccessAIBudgeting;
  
  // React Query mutations
  const createBudgetMutation = useCreateBudget();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const reorderCategoriesMutation = useReorderCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();


  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudget, setTotalBudget] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const currency: Currency = currentCurrency; // Use selected currency
  const [newTotal, setNewTotal] = useState("");
  const [newMonth, setNewMonth] = useState("January");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  
  // AI Budget Creation
  const [aiDescription, setAiDescription] = useState("");
  const { createBudgetFromAI, isProcessing: isAICreating, currentStep } = useAIBudgetCreation();
  
  // Notification prompt for first budget creation
  const [showFirstBudgetNotificationPrompt, setShowFirstBudgetNotificationPrompt] = useState(false);

  // Internal month values stay English; display labels are localized via t()
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

  const monthTranslationKeys = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ] as const;

  const getMonthLabel = (monthName: string) => {
    const index = months.indexOf(monthName);
    return index >= 0 ? t(monthTranslationKeys[index]) : monthName;
  };

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

  const existingCategoryNames = categories.map((category) => category.name);

  // Category CRUD handlers
  const handleAddCategory = async (
    name: string,
    budgeted: number
  ) => {
    if (!userId || !budget) return;

    if (hasDuplicateName(name, existingCategoryNames)) {
      toast.error(t("categoryNameAlreadyExists"));
      return;
    }

    try {
      await createCategoryMutation.mutateAsync({
        name,
        budgeted,
        budgetId: budget._id,
        userId,
      });
      // Budget totals are automatically updated by the API
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("categoryNameAlreadyExists")
      );
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    try {
      const category = categories.find(
        (c) => c._id === categoryId || c.id === categoryId
      );
      if (!category) return;

      await deleteCategoryMutation.mutateAsync(categoryId);
      // Budget totals are automatically updated by the API
    } catch (error) {
      console.error("Error removing category:", error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !budget || !userId) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    const reordered = [...categoriesWithSpent];
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);

    const categoryIds = reordered.map((c) => c._id || c.id).filter(Boolean) as string[];
    const queryKey = categoryKeys.list(userId);

    const previousCategories =
      queryClient.getQueryData<Category[]>(queryKey) ?? categories;
    const reorderedRaw = categoryIds
      .map((id) => previousCategories.find((c) => (c._id || c.id) === id))
      .filter(Boolean) as Category[];

    queryClient.setQueryData(queryKey, reorderedRaw);

    try {
      await reorderCategoriesMutation.mutateAsync({
        budgetId: String(budget._id),
        categoryIds,
      });
    } catch (error) {
      console.error("Error reordering categories:", error);
      queryClient.setQueryData(queryKey, previousCategories);
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

      if (hasDuplicateName(name, existingCategoryNames, category.name)) {
        toast.error(t("categoryNameAlreadyExists"));
        return;
      }

      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        updates: { name, budgeted },
      });
      // Budget totals are automatically updated by the API
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("categoryNameAlreadyExists")
      );
    }
  };



  // Update total budget
  const handleSetTotalBudget = async () => {
    if (!budget) return;
    
    const amount = parseDecimalInput(totalBudget);
    if (amount < 0) {
      toast.error(t("enterValidAmount"));
      return;
    }

    const currentlyBudgeted = budget.totalBudgeted || 0;

    if (amount < currentlyBudgeted) {
      toast.error(t("newTotalCannotBeLess"));
      return;
    }

    const newTotalAvailable = amount - currentlyBudgeted;

    try {
      await updateBudgetMutation.mutateAsync({
        id: budget._id,
        updates: {
          totalBudgeted: currentlyBudgeted, // Keep currently budgeted amount
          totalAvailable: newTotalAvailable, // Adjust available amount
        },
      });

      setIsEditingTotal(false);
      setTotalBudget("");
    } catch (error) {
      console.error("Failed to update budget:", error);
      toast.error(t("failedToUpdateBudget"));
    }
  };



  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseDecimalInput(newTotal);
    if (isNaN(total) || total <= 0) {
      toast.error(t("enterValidTotalBudget"));
      return;
    }
    if (!userId) {
      console.error("No userId available:", {
        session,
        userId,
        userIdLoading,
        userIdError,
      });
      toast.error(t("mustBeSignedInToCreateBudget"));
      return;
    }



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

      
      // Reset form after successful creation
      setNewTotal("");
      setNewMonth("January");
      setNewYear(new Date().getFullYear());
      
      // Force refetch budget data to show the new budget
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
      // Show notification prompt for first budget creation
      // Check if this is the user's first budget by checking if they had any budgets before
      const existingBudgets = queryClient.getQueryData(["budgets"]);
      const isFirstBudget = !existingBudgets || (Array.isArray(existingBudgets) && existingBudgets.length === 0);
      
      if (isFirstBudget) {
        // Show notification prompt after a short delay
        setTimeout(() => {
          setShowFirstBudgetNotificationPrompt(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create budget:", error);
      toast.error(t("failedToCreateBudget"));
    }
  };

  const handleCreateBudgetWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Edge case: Validate description length
    if (!aiDescription.trim()) {
      toast.error(t("enterBudgetDescription"));
      return;
    }

    if (aiDescription.trim().length < 10) {
      toast.error(t("provideDetailedDescription"));
      return;
    }

    if (!userId) {
      toast.error(t("mustBeSignedInToCreateBudget"));
      return;
    }

    // Edge case: Validate month and year
    const monthNumber = getMonthNumber(newMonth);
    if (monthNumber < 1 || monthNumber > 12) {
      toast.error(t("selectValidMonth"));
      return;
    }

    if (newYear < 2020 || newYear > 2030) {
      toast.error(t("selectValidYear"));
      return;
    }

    try {
      await createBudgetFromAI(aiDescription, monthNumber, newYear);
      
      toast.success(t("budgetCreatedWithAI"));
      setAiDescription("");
      
      // Force refetch budget data to show the new budget
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
      // Show notification prompt for first budget creation
      // Check if this is the user's first budget by checking if they had any budgets before
      const existingBudgets = queryClient.getQueryData(["budgets"]);
      const isFirstBudget = !existingBudgets || (Array.isArray(existingBudgets) && existingBudgets.length === 0);
      
      if (isFirstBudget) {
        // Show notification prompt after a short delay
        setTimeout(() => {
          setShowFirstBudgetNotificationPrompt(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Failed to create budget with AI:", error);
      
      // Edge case: Show user-friendly error messages
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("failedToCreateBudgetAI"));
      }
    }
  };

  const handleDeleteBudget = async () => {
    if (!budget?._id) return;

    try {
      await deleteBudgetMutation.mutateAsync(budget._id);

    } catch (error) {
      console.error("Failed to delete budget:", error);
      toast.error(t("failedToDeleteBudget"));
    }
  };

  if (!session) return <div>{t('pleaseSignIn')}</div>;

  // Show loading state while fetching userId
  if (userIdLoading) {
    return (
      <Card className="glass-card hover-card max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle>{t('loading')}</CardTitle>
          <CardDescription>
            {t('please')} {t('loading').toLowerCase()}
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
          <CardTitle>{t('error')}</CardTitle>
          <CardDescription>
            {t('technicalDifficulties')}
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
  

  // Show create form if no budget
  if (!budget) {
    return (
      <>
        <AILoading isProcessing={isAICreating} currentStep={currentStep} />
        <Card className="glass-card hover-card group ai-card-bg shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="relative">
              <Sparkles className="h-6 w-6 ai-gradient-text animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 ai-gradient rounded-full animate-ping" />
            </div>
            <span className="ai-gradient-text font-bold">
              {t("createYourBudget")}
            </span>
            <Zap className="h-5 w-5 text-success animate-bounce" />
          </CardTitle>
          <CardDescription className="text-base">
            {t("chooseHowToCreate")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className={`grid w-full ${isAIFeatureFlagEnabled ? "grid-cols-2" : "grid-cols-1"}`}>
              <TabsTrigger value="manual" className="text-sm font-medium">
                {t("manualSetup")}
              </TabsTrigger>
              {isAIFeatureFlagEnabled && (
                <TabsTrigger value="ai" className="flex items-center gap-2 text-sm font-medium ai-tab-trigger transition-all duration-200">
                  <Sparkles className="h-4 w-4 flex-shrink-0 ai-gradient-text" />
                  {t("aiAssistant")}
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="manual" className="space-y-4 mt-4">
          <form onSubmit={handleCreateBudget} className="space-y-4">
            <Input
              type="number"
              placeholder={t("totalBudgetPlaceholder")}
              value={newTotal}
              onChange={(e) => setNewTotal(e.target.value)}
              min={0}
              step="0.01"
              required
            />
            <div className="flex gap-2">
              <Select value={newMonth} onValueChange={setNewMonth}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectMonthPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {getMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder={t("yearPlaceholder")}
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                min={2000}
                max={2100}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span className="animate-pulse">{t('creatingBudget')}</span>
                </>
              ) : (
                t('createBudget')
              )}
            </Button>
          </form>
            </TabsContent>
            
            {isAIFeatureFlagEnabled && (
            <TabsContent value="ai" className="space-y-4 mt-4">
              {showAIBudgetCreation ? (
                <form onSubmit={handleCreateBudgetWithAI} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="aiDescription" className="text-sm font-medium text-foreground">
                    {t("describeYourBudget")}
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
                                       {aiDescription.length < 10 ? t("needMoreDetail") : t("goodDescription")}
                                     </span>
                                   </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2 text-foreground">{t('examples')}:</p>
                  <ul className="list-disc list-inside space-y-1 mt-2 text-muted-foreground">
                    <li>"I make 5000. Rent 2000, food 1000, the rest is savings."</li>
                    <li>"My income is 3000. I spend 1200 on rent, 800 on food, 300 on transport, and save the rest."</li>
                    <li>"I earn 6000 monthly. 2500 for rent, 1000 for food, 500 for utilities, and the rest goes to savings."</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Select value={newMonth} onValueChange={setNewMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectMonthPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {getMonthLabel(month)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder={t("yearPlaceholder")}
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    min={2000}
                    max={2100}
                    required
                  />
                </div>
                
                                                                 <Button
                  type="submit"
                  className="w-full ai-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
                  disabled={!aiDescription.trim() || isAICreating}
                >
                  {isAICreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      <span className="animate-pulse">{t('creatingBudgetWithAI')}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 flex-shrink-0" />
                      {t("createBudgetWithAIButton")}
                    </>
                  )}
                </Button>
              </form>
              ) : (
                <UpgradeToProCTA feature="aiBudgeting" />
              )}
            </TabsContent>
            )}
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
              <CardTitle className="text-xl sm:text-2xl font-semibold text-foreground">
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
                  <AlertDialogTitle>{t('deleteBudget')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('areYouSureDeleteBudget')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteBudget}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('deleteBudget')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="text-right">
            {isEditingTotal ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder={t("totalBudgetPlaceholder")}
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
                    {t("setLabel")}
                  </LoadingButton>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingTotal(false)}
                    className="flex-1 sm:flex-none"
                  >
                    {t('cancel')}
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
                    currency,
                    decimalSeparator
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
                  {t('totalBudgeted')} ({t('edit')})
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              {t('budgeted')}
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(calculatedTotalBudgeted, currency, decimalSeparator)}
            </div>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-slate-900/10 dark:bg-white/10 backdrop-blur-sm border border-slate-900/20 dark:border-white/20">
            <div className="text-xs sm:text-sm text-slate-600 dark:text-white/60">
              {t('availableToBudget')}
            </div>
            <div className="text-base sm:text-lg font-medium mt-1 text-slate-900 dark:text-white">
              {formatMoney(budget?.totalAvailable || 0, currency, decimalSeparator)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {budget && categoriesWithSpent.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4"
                  >
                    {categoriesWithSpent.map((category, index) => (
                      <Draggable
                        key={category._id || category.id}
                        draggableId={category._id || category.id || `cat-${index}`}
                        index={index}
                      >
                        {(draggableProvided) => (
                          <BudgetCategoryItem
                            category={category}
                            onRemove={handleRemoveCategory}
                            onUpdate={handleUpdateCategory}
                            totalAvailable={budget.totalAvailable}
                            existingCategoryNames={existingCategoryNames}
                            dragHandleProps={draggableProvided.dragHandleProps}
                            draggableProps={draggableProvided.draggableProps}
                            innerRef={draggableProvided.innerRef}
                          />
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4 rounded-lg bg-slate-900/5 dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/20 dark:bg-white/20 mb-3 sm:mb-4">
                <Icon size={24} className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 dark:text-white" />
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                {t('noBudgetSections')}
              </p>
            </div>
          )}

          {showCategoryForm ? (
            <NewCategoryForm
              onComplete={(name: string, budgeted: number) => {
                handleAddCategory(name, budgeted);
                setShowCategoryForm(false); // Hide form after adding category
              }}
              onCancel={() => setShowCategoryForm(false)}
              totalAvailable={budget?.totalAvailable || 0}
              existingCategoryNames={existingCategoryNames}
            />
          ) : (
            <Button
              onClick={() => setShowCategoryForm(true)}
              className="w-full mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('addCategory')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    
    {/* Notification prompt for first budget creation */}
    {showFirstBudgetNotificationPrompt && (
      <NotificationPrompt 
        onDismiss={() => setShowFirstBudgetNotificationPrompt(false)}
        showForExistingUsers={false}
      />
    )}
    </>
  );
};

export default BudgetSetupSection;
