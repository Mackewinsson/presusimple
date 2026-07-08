"use client";

import React, { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useUserId, useCategoriesByBudget, useBudget } from "@/lib/hooks";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Zap, XCircle, CheckCircle, AlertCircle, Plus, Minus, AlertTriangle, X, Camera, ImageIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { formatMoney, parseDecimalInput } from "@/lib/utils/formatMoney";
import { AITransactionLoading } from "@/components/ui/ai-transaction-loading";
import { useToast } from "@/hooks/use-toast";

interface ParsedTransaction {
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  suggestedCategories?: string[]; // New: AI suggestions for better categorization
}

interface MissingCategory {
  name: string;
  transactions: ParsedTransaction[];
  totalAmount: number;
  suggestedCategories?: string[]; // New: AI suggestions for this category
}

interface CategoryBudget {
  name: string;
  budgeted: number;
}

interface TransactionPreviewProps {
  transactions: ParsedTransaction[];
  missingCategories: MissingCategory[];
  availableBudget: number;
  availableCategories: any[]; // New: Available categories for selection
  onConfirm: (transactions: ParsedTransaction[], newCategoriesToCreate: CategoryBudget[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const TransactionPreview = ({ transactions, missingCategories, availableBudget, availableCategories, onConfirm, onCancel, isSaving }: TransactionPreviewProps) => {
  const { t } = useTranslation();
  const [newCategoriesToCreate, setNewCategoriesToCreate] = useState<CategoryBudget[]>([]);
  const [budgetInputs, setBudgetInputs] = useState<Record<string, number>>({});
  const [categoryChanges, setCategoryChanges] = useState<Record<number, string>>({});

  const handleCategoryToggle = (categoryName: string) => {
    setNewCategoriesToCreate(prev => {
      const exists = prev.find(cat => cat.name === categoryName);
      if (exists) {
        return prev.filter(cat => cat.name !== categoryName);
      } else {
        return [...prev, { name: categoryName, budgeted: budgetInputs[categoryName] || 0 }];
      }
    });
  };

  const handleBudgetChange = (categoryName: string, amount: number) => {
    setBudgetInputs(prev => ({ ...prev, [categoryName]: amount }));
    
    // Update the category in newCategoriesToCreate if it exists
    setNewCategoriesToCreate(prev => {
      const exists = prev.find(cat => cat.name === categoryName);
      if (exists) {
        return prev.map(cat => cat.name === categoryName ? { ...cat, budgeted: amount } : cat);
      }
      return prev;
    });
  };

  const handleCategoryChange = (transactionIndex: number, newCategory: string) => {

    setCategoryChanges(prev => {
      const newChanges = { ...prev, [transactionIndex]: newCategory };
      
      return newChanges;
    });
  };

  const handleConfirm = () => {
    // Apply category changes to transactions
    const updatedTransactions = transactions.map((transaction, index) => ({
      ...transaction,
      category: categoryChanges[index] || transaction.category
    }));
    onConfirm(updatedTransactions, newCategoriesToCreate);
  };

  const totalBudgetNeeded = newCategoriesToCreate.reduce((sum, cat) => sum + cat.budgeted, 0);
  const hasInsufficientBudget = totalBudgetNeeded > availableBudget;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain sm:space-y-6">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-success animate-pulse" />
        <span>{t("aiFound")} {transactions.length} {t("transactionsExclamation")}</span>
      </div>
      
      {/* Budget Summary */}
      <div className="p-3 sm:p-4 border border-accent/30 rounded-lg bg-accent/10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 mb-3">
          <span className="font-medium text-foreground">{t('availableBudget')}</span>
          <span className="font-mono text-foreground">${availableBudget.toFixed(2)}</span>
        </div>
        {newCategoriesToCreate.length > 0 && (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t('budgetNeededForNewCategories')}</span>
            <span className={`font-mono ${hasInsufficientBudget ? 'text-destructive' : 'text-success'}`}>
              ${totalBudgetNeeded.toFixed(2)}
            </span>
          </div>
        )}
        {hasInsufficientBudget && (
          <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{t('insufficientBudget')}</span>
          </div>
        )}
      </div>
      
      {/* Missing Categories Section */}
      {missingCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">{t('newCategoriesFound')}</span>
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {t("aiSuggestedCategoriesHint")}
          </div>
          {missingCategories.map((missingCategory, index) => {
            const isSelected = newCategoriesToCreate.some(cat => cat.name === missingCategory.name);
            const budgetAmount = budgetInputs[missingCategory.name] || 0;
            
            return (
              <div 
                key={index}
                className={`p-3 sm:p-4 border rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'border-warning/50 bg-warning/10' 
                    : 'border-warning/30 bg-warning/5'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-medium text-warning">{missingCategory.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {missingCategory.transactions.length} {t("transactionsWord")} • {t("totalLabel")}: ${missingCategory.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryToggle(missingCategory.name)}
                    className={`w-full sm:w-auto shrink-0 ${
                      isSelected 
                        ? "accent-fill border-0 shadow-md" 
                        : "bg-secondary text-secondary-foreground border-0 hover:bg-secondary/80"
                    } transition-all duration-200`}
                  >
                    {isSelected ? t('willCreate') : t('addCategory')}
                  </Button>
                </div>
                
                {isSelected && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Label htmlFor={`budget-${index}`} className="text-sm text-muted-foreground shrink-0">
                        {t("budgetAllocation")}
                      </Label>
                      <div className="relative w-full sm:w-auto">
                        <Icon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`budget-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetAmount}
                          onChange={(e) => handleBudgetChange(missingCategory.name, parseDecimalInput(e.target.value))}
                          className="pl-8 w-full sm:w-32"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("recommendedLabel")}: ${missingCategory.totalAmount.toFixed(2)} {t("basedOnTransactionTotal")}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-foreground mb-3">{t('transactionsToSave')}</div>
        {transactions.map((transaction, index) => {
          const isMissingCategory = missingCategories.some(mc => 
            mc.transactions.some(t => t === transaction)
          );
          const missingCategory = missingCategories.find(mc => 
            mc.transactions.some(t => t === transaction)
          );
          const currentCategory = categoryChanges[index] || transaction.category;
          
          return (
            <div 
              key={index} 
              className={`p-3 sm:p-4 border rounded-lg transition-colors ${
                isMissingCategory ? 'border-warning/50 bg-warning/5' : ''
              }`}
            >
              <div className="flex flex-col gap-3 mb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium min-w-0 flex-1 break-words">{transaction.description}</div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={transaction.type === "expense" ? "destructive" : "default"}>
                      {transaction.type}
                    </Badge>
                    <span className="font-mono font-medium whitespace-nowrap">
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-2">
                  <span className="block">{t('category')}:</span>
                  <Select value={currentCategory} onValueChange={(value) => handleCategoryChange(index, value)}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isMissingCategory && (
                    <Badge variant="outline" className="text-warning border-warning w-fit">
                      {t("newCategoryBadge")}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Category Suggestions */}
              {transaction.suggestedCategories && transaction.suggestedCategories.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  <span>{t('betterCategoryOptions')} </span>
                  {transaction.suggestedCategories
                    .filter(suggestion => availableCategories.some(cat => cat.name === suggestion))
                    .map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleCategoryChange(index, suggestion);
                        }}
                        className="font-medium text-primary underline-offset-2 hover:underline mr-2"
                      >
                        {suggestion}
                      </button>
                    ))}
                </div>
              )}
              
              {/* Fallback: Show all available categories as suggestions if no AI suggestions match */}
              {(!transaction.suggestedCategories || 
                transaction.suggestedCategories.filter(suggestion => 
                  availableCategories.some(cat => cat.name === suggestion)
                ).length === 0) && (
                <div className="text-xs text-muted-foreground mt-2">
                  <span>{t('availableCategories')} </span>
                  {availableCategories
                    .filter(cat => cat.name !== currentCategory) // Don't suggest current category
                    .map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          handleCategoryChange(index, cat.name);
                        }}
                        className="font-medium text-primary underline-offset-2 hover:underline mr-2"
                      >
                        {cat.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
      
      <div className="shrink-0 flex flex-col gap-2 border-t border-border bg-background pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:gap-3 sm:pb-0 sm:pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isSaving || hasInsufficientBudget}
          className={`w-full sm:flex-1 ${
            hasInsufficientBudget 
              ? "bg-destructive text-destructive-foreground opacity-50 cursor-not-allowed" 
              : "accent-fill hover:bg-accent/90 font-semibold shadow-lg hover:shadow-xl"
          } transition-colors border-0`}
        >
          {isSaving ? t("savingEllipsis") : `${t("saveTransactionsButton")}${newCategoriesToCreate.length > 0 ? ` ${t("andCreateCategories")} (${newCategoriesToCreate.length})` : ''}`}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto bg-secondary text-secondary-foreground border-0 hover:bg-secondary/80 transition-colors"
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};

export const AITransactionInput = ({ budgetId }: { budgetId: string }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [missingCategories, setMissingCategories] = useState<MissingCategory[]>([]);
  const [availableBudget, setAvailableBudget] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState<"analyzing" | "parsing" | "matching" | "complete">("analyzing");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const userId = useUserId();
  const queryClient = useQueryClient();

  // Fetch categories for this budget
  const { data: categories, isLoading: isLoadingCategories, refetch: refetchCategories } = useCategoriesByBudget(budgetId);
  const { data: budget, isLoading: isLoadingBudget, refetch: refetchBudget } = useBudget(budgetId);



  // Force refetch categories when component mounts or budgetId changes
  React.useEffect(() => {
    if (budgetId && refetchCategories) {
      refetchCategories();
    }
  }, [budgetId, refetchCategories]);

  // Use React Query to get budget data
  const { data: budgetData } = useBudget(budgetId);
  
  React.useEffect(() => {
    if (budgetData) {
      setAvailableBudget(budgetData.totalAvailable || 0);
    }
  }, [budgetData]);

  const parseTransactions = useMutation({
    mutationFn: async (description: string) => {
      const categoryNames = (categories || []).map((cat: any) => cat.name);
      
      const response = await fetch('/api/transactions/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          imageBase64,
          userId: userId?.data,
          budgetId,
          categories: categoryNames // Pass available categories
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse transactions');
      }

      const result = await response.json();
      return result;
    },
  });

  const createCategory = useMutation({
    mutationFn: async (categoryData: { name: string; budgeted: number }) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryData.name,
          budgeted: categoryData.budgeted,
          budget: budgetId,
          sectionName: "General" // Default section
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      return response.json();
    },
  });

  const saveExpense = useMutation({
          mutationFn: async (transaction: ParsedTransaction) => {
        // Find matching category from our loaded categories
        const matchingCategory = (categories || []).find((cat: any) => 
          cat.name.toLowerCase() === transaction.category.toLowerCase()
        );
      
      if (!matchingCategory) {
        throw new Error(`Category "${transaction.category}" not found in budget`);
      }

      // Save the expense
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId?.data, // Extract the actual user ID string
          budget: budgetId,
          categoryId: matchingCategory._id,
          amount: transaction.amount,
          description: transaction.description,
          type: transaction.type,
          date: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save expense');
      }

      return response.json();
    },
  });

  const processImageFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t("error"), description: t("imageTooLarge"), variant: "destructive" });
      return;
    }

    setImageFile(file);
    
    // Compress and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimension
        const MAX_SIZE = 1024;
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImageBase64(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processImageFile(file);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault(); // Prevent pasting the image name as text
          processImageFile(file);
          break; // Process only the first image
        }
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageBase64(null);
  };

  const handleParse = async () => {
    // Input validation
    if (!description.trim() && !imageBase64) {
      toast({
        title: t("error"),
        description: t("enterDescriptionOrImage"),
        variant: "destructive",
      });
      return;
    }

    if (description.length > 500) {
      toast({
        title: t("error"),
        description: t("descriptionTooLong"),
        variant: "destructive",
      });
      return;
    }

    if (!imageBase64 && !/\d/.test(description)) {
      toast({
        title: (t as any)('missingAmount'),
        description: (t as any)('missingAmountDesc'),
      });
      return;
    }

    // Check if categories are loaded
    if (categories?.length === 0) {
      toast({
        title: t("error"),
        description: t("noCategoriesSetup"),
        variant: "destructive",
      });
      return;
    }



    if (!userId?.data) {
      toast({
        title: t("error"),
        description: t("mustBeSignedIn"),
        variant: "destructive",
      });
      return;
    }

    if (!budgetId) {
      toast({
        title: t("error"),
        description: t("noBudgetSelected"),
        variant: "destructive",
      });
      return;
    }

    if (categories?.length === 0) {
      toast({
        title: t("error"),
        description: t("noCategoriesSetup"),
        variant: "destructive",
      });
      return;
    }

    setIsParsing(true);
    setCurrentStep("analyzing");
    
    try {
      // Step 1: Analyzing (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep("parsing");

      // Step 2: Parsing (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep("matching");

      // Step 3: API call and matching (1.5 seconds)
      const result = await parseTransactions.mutateAsync(description);

      if (!result.transactions || result.transactions.length === 0) {
        toast({
          title: t("aiNoTransactionsFound"),
          description: t("tryDescribingClearly"),
          variant: "destructive",
        });
        return;
      }

      // Validate parsed transactions
      const validTransactions = result.transactions.filter((transaction: ParsedTransaction) => {
        if (!transaction.description || !transaction.amount || !transaction.type || !transaction.category) {
          return false;
        }
        if (transaction.amount <= 0) {
          return false;
        }
        if (!['expense', 'income'].includes(transaction.type)) {
          return false;
        }
        return true;
      });

      if (validTransactions.length === 0) {
        toast({
          title: t("invalidTransactions"),
          description: t("couldNotParseValid"),
          variant: "destructive",
        });
        return;
      }

      // Step 4: Complete
      setCurrentStep("complete");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for missing categories and calculate totals
      const missingCategoriesMap = new Map<string, ParsedTransaction[]>();
      
      validTransactions.forEach((transaction: ParsedTransaction) => {
        const matchingCategory = (categories || []).find((cat: any) => 
          cat.name.toLowerCase() === transaction.category.toLowerCase()
        );
        
        if (!matchingCategory) {
          if (!missingCategoriesMap.has(transaction.category)) {
            missingCategoriesMap.set(transaction.category, []);
          }
          missingCategoriesMap.get(transaction.category)!.push(transaction);
        }
      });

      const missingCategoriesArray = Array.from(missingCategoriesMap.entries()).map(([name, transactions]) => ({
        name,
        transactions,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0)
      }));

      setMissingCategories(missingCategoriesArray);
      setParsedTransactions(validTransactions);
      setIsOpen(true);
      
    } catch (error) {
      console.error("Failed to parse transactions:", error);
      let errorMessage = t("failedToParseTransactions");
      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          errorMessage = t("tooManyRequests");
        } else if (error.message.includes("network")) {
          errorMessage = t("networkError");
        } else if (error.message.includes("401")) {
          errorMessage = t("authError");
        } else if (error.message.includes("500")) {
          errorMessage = t("serverError");
        } else {
          errorMessage = error.message;
        }
      }
      toast({ title: t("error"), description: errorMessage, variant: "destructive", });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async (transactions: ParsedTransaction[], newCategoriesToCreate: CategoryBudget[]) => {
    if (transactions.length === 0) {
      toast({
        title: t("error"),
        description: t("noTransactionsToSave"),
        variant: "destructive",
      });
      return;
    }

    // Check if we have sufficient budget
    const totalBudgetNeeded = newCategoriesToCreate.reduce((sum, cat) => sum + cat.budgeted, 0);
    if (totalBudgetNeeded > availableBudget) {
      toast({
        title: t("insufficientBudgetTitle"),
        description: `${t("insufficientBudgetDesc")} ($${totalBudgetNeeded.toFixed(2)} > $${availableBudget.toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: Create new categories if needed
      const createdCategories = new Map<string, any>();
      
      if (newCategoriesToCreate.length > 0) {
        toast({
          title: t("creatingCategories"),
          description: t("creatingCategoriesDesc"),
        });

        for (const categoryData of newCategoriesToCreate) {
          try {
            const newCategory = await createCategory.mutateAsync(categoryData);
            createdCategories.set(categoryData.name.toLowerCase(), newCategory);
          } catch (error) {
            console.error(`Failed to create category ${categoryData.name}:`, error);
            toast({
              title: t("error"),
              description: `${t("failedToCreateCategory")}: "${categoryData.name}"`,
              variant: "destructive",
            });
            return;
          }
        }

        // Reload categories to include the new ones
        await refetchCategories();
        // Reload budget to get updated available amount
        await refetchBudget();
      }

      // Step 2: Save all transactions
      const results = await Promise.allSettled(
        transactions.map(async (transaction) => {
                      // Find matching category (existing or newly created)
            let matchingCategory = (categories || []).find((cat: any) => 
              cat.name.toLowerCase() === transaction.category.toLowerCase()
            );
          
          // If not found in existing categories, check newly created ones
          if (!matchingCategory) {
            matchingCategory = createdCategories.get(transaction.category.toLowerCase());
          }
          
          if (!matchingCategory) {
            throw new Error(`Category "${transaction.category}" not found`);
          }

          // Save the expense
          const response = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: userId?.data,
              budget: budgetId,
              categoryId: matchingCategory._id,
              amount: transaction.amount,
              description: transaction.description,
              type: transaction.type,
              date: new Date().toISOString()
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save expense');
          }

          return response.json();
        })
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        toast({
          title: t("success"),
          description: `${successful} ${t("transactionsSaved")}${failed > 0 ? `, ${failed} ${t("transactionsFailed")}` : ''}${newCategoriesToCreate.length > 0 ? `, ${newCategoriesToCreate.length} ${t("categoriesCreated")}` : ''}`,
        });
      } else {
        toast({
          title: t("error"),
          description: t("failedToSaveAny"),
          variant: "destructive",
        });
        return;
      }
      
      // Reset form
      setDescription("");
      setImageFile(null);
      setImageBase64(null);
      setParsedTransactions([]);
      setMissingCategories([]);
      setIsOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
    } catch (error) {
      console.error("Failed to save transactions:", error);
      
      let errorMessage = t("failedToSaveTransactions");
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = t("networkError");
        } else if (error.message.includes("401")) {
          errorMessage = t("authError");
        } else if (error.message.includes("500")) {
          errorMessage = t("serverError");
        } else if (error.message.includes("category")) {
          errorMessage = t("categoryNotFoundCheck");
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t("error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDescription("");
    setImageFile(null);
    setImageBase64(null);
    setParsedTransactions([]);
    setMissingCategories([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleParse();
    }
  };

  return (
    <>
      <AITransactionLoading isProcessing={isParsing} currentStep={currentStep} />
      
      {/* Command bar */}
      <div className="group relative mb-2 w-full transition-all duration-300">
        <div
          className={`absolute -inset-0.5 rounded-xl blur opacity-20 transition duration-1000 group-hover:opacity-60 group-hover:duration-200 ${
            isParsing ? "animate-pulse ai-gradient-glow-active" : "ai-gradient-glow"
          }`}
        />

        <div className="relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card text-card-foreground shadow-lg">
          {imageBase64 && (
            <div className="relative w-full border-b border-border/30 bg-muted/30 p-3">
              <div className="flex items-center gap-3">
                <div className="group/img relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border/50 shadow-sm">
                  <img
                    src={imageBase64}
                    alt="Receipt preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-destructive group-hover/img:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {imageFile?.name || t("pastedImage")}
                  </p>
                  <p className="text-xs">{t("readyForAI")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-3">
            <Sparkles
              className={`h-5 w-5 flex-shrink-0 text-success ${
                isParsing ? "animate-spin ai-gradient-text" : ""
              }`}
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={
                isParsing || isLoadingCategories || categories?.length === 0
              }
              placeholder={
                imageBase64 ? t("addOptionalDescription") : t("aiExample")
              }
              autoFocus
              className="min-h-[44px] max-h-[150px] w-full flex-1 resize-none border-0 bg-transparent px-0 py-1.5 text-base shadow-none placeholder:text-sm placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
              style={{ fieldSizing: "content" } as React.CSSProperties}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/30 bg-muted/20 px-4 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 flex-shrink-0 rounded-full text-muted-foreground transition-colors hover:text-foreground"
                disabled={isParsing}
                title={t("uploadReceiptImage")}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              {description && !isParsing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDescription("")}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <span className="ml-1 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                <Zap className="h-3 w-3" />
                {(t as (key: string) => string)("pressEnterMagic")}
              </span>
            </div>

            <Button
              onClick={handleParse}
              disabled={
                (!description.trim() && !imageBase64) ||
                isParsing ||
                isLoadingCategories ||
                categories?.length === 0
              }
              className={`h-9 shrink-0 rounded-lg px-5 transition-all duration-300 ${
                !description.trim() && !imageBase64
                  ? "bg-secondary text-secondary-foreground"
                  : "accent-fill shadow-sm hover:bg-accent/90 hover:shadow-md"
              }`}
            >
              {isParsing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-accent-foreground" />
              ) : (
                <span className="text-sm font-semibold">
                  {t("transformWithAI")}
                </span>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border/20 px-4 py-2 sm:hidden">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              {(t as (key: string) => string)("pressEnterMagic")}
            </span>
            {categories?.length === 0 && !isLoadingCategories && (
              <span className="text-xs font-medium text-destructive/80">
                {(t as (key: string) => string)("categoriesSetupRequired")}
              </span>
            )}
          </div>

          {categories?.length === 0 && !isLoadingCategories && (
            <div className="hidden border-t border-border/20 px-4 py-2 sm:block">
              <span className="text-xs font-medium text-destructive/80">
                {(t as (key: string) => string)("categoriesSetupRequired")}
              </span>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-0 overflow-hidden border-accent/20 p-0 pt-0 sm:max-w-4xl [&>div:first-child]:hidden">
          <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-4 pb-3 pt-1 pr-12 text-left">
            <DialogTitle className="text-base sm:text-xl flex items-center gap-2 leading-snug">
              <Sparkles className="h-5 w-5 shrink-0 text-success" /> {t('reviewTransactions')}
            </DialogTitle>
            <DialogDescription className="text-left text-sm">
              {t("reviewParsedTransactions")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4">
            <TransactionPreview
              transactions={parsedTransactions}
              missingCategories={missingCategories}
              availableBudget={availableBudget}
              availableCategories={categories || []}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isSaving={isSaving}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 