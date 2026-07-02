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
import { Sparkles, Zap, XCircle, CheckCircle, AlertCircle, Plus, Minus, AlertTriangle } from "lucide-react";
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
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-accent animate-pulse" />
        <span>AI found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}!</span>
      </div>
      
      {/* Budget Summary */}
      <div className="p-4 border border-accent/30 rounded-lg bg-accent/10">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-foreground">{t('availableBudget')}</span>
          <span className="font-mono text-foreground">${availableBudget.toFixed(2)}</span>
        </div>
        {newCategoriesToCreate.length > 0 && (
          <div className="flex items-center justify-between text-sm mb-2">
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
            The AI suggested categories that don't exist in your budget. Set budget allocations for each:
          </div>
          {missingCategories.map((missingCategory, index) => {
            const isSelected = newCategoriesToCreate.some(cat => cat.name === missingCategory.name);
            const budgetAmount = budgetInputs[missingCategory.name] || 0;
            
            return (
              <div 
                key={index}
                className={`p-3 border rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'border-warning/50 bg-warning/10' 
                    : 'border-warning/30 bg-warning/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-warning">{missingCategory.name}</span>
                    <div className="text-xs text-muted-foreground">
                      {missingCategory.transactions.length} transaction{missingCategory.transactions.length !== 1 ? 's' : ''} • Total: ${missingCategory.totalAmount.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategoryToggle(missingCategory.name)}
                    className={`${
                      isSelected 
                        ? "bg-accent text-accent-foreground border-0 shadow-md" 
                        : "bg-secondary text-secondary-foreground border-0 hover:bg-secondary/80"
                    } transition-all duration-200 transform hover:scale-105`}
                  >
                    {isSelected ? t('willCreate') : t('addCategory')}
                  </Button>
                </div>
                
                {isSelected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`budget-${index}`} className="text-sm text-muted-foreground">
                        Budget Allocation:
                      </Label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`budget-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetAmount}
                          onChange={(e) => handleBudgetChange(missingCategory.name, parseDecimalInput(e.target.value))}
                          className="pl-8 w-32"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: ${missingCategory.totalAmount.toFixed(2)} (based on transaction total)
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
              className={`p-4 border rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-left-2 ${
                isMissingCategory ? 'border-warning/50 bg-warning/5' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium mb-2">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>{t('category')}:</span>
                    <Select value={currentCategory} onValueChange={(value) => handleCategoryChange(index, value)}>
                      <SelectTrigger className="w-full sm:w-48 h-8 text-xs">
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
                        New Category
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={transaction.type === "expense" ? "destructive" : "default"}>
                    {transaction.type}
                  </Badge>
                  <span className="font-mono font-medium">
                    ${transaction.amount.toFixed(2)}
                  </span>
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
                        className="text-accent hover:text-accent/80 underline mr-2"
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
                        className="text-accent hover:text-accent/80 underline mr-2"
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
      
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
        <Button
          onClick={handleConfirm}
          disabled={isSaving || hasInsufficientBudget}
          className={`flex-1 ${
            hasInsufficientBudget 
              ? "bg-destructive text-destructive-foreground opacity-50 cursor-not-allowed" 
              : "bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shadow-lg hover:shadow-xl"
          } transition-all duration-300 transform hover:scale-[1.02] border-0`}
        >
          {isSaving ? "Saving..." : `Save Transactions${newCategoriesToCreate.length > 0 ? ` & Create ${newCategoriesToCreate.length} Categor${newCategoriesToCreate.length === 1 ? 'y' : 'ies'}` : ''}`}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="bg-secondary text-secondary-foreground border-0 hover:bg-secondary/80 transition-all duration-200 transform hover:scale-105"
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

  const handleParse = async () => {
    // Input validation
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction description",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 500) {
      toast({
        title: "Error",
        description: "Description is too long. Please keep it under 500 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!/\d/.test(description)) {
      toast({
        title: "Missing amount",
        description: "💡 Please include a number for the amount (e.g., 'coffee 5', 'lunch 15')",
      });
      return;
    }

    // Check if categories are loaded
    if (categories?.length === 0) {
      toast({
        title: "Error",
        description: "No categories available. Please set up your budget categories first.",
        variant: "destructive",
      });
      return;
    }



    if (!userId?.data) {
      toast({
        title: "Error",
        description: "You must be signed in to add transactions",
        variant: "destructive",
      });
      return;
    }

    if (!budgetId) {
      toast({
        title: "Error",
        description: "No budget selected. Please create a budget first.",
        variant: "destructive",
      });
      return;
    }

    if (categories?.length === 0) {
      toast({
        title: "Error",
        description: "No categories found. Please set up budget categories first.",
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
          title: "No transactions found",
          description: "Try describing your transactions more clearly",
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
          title: "Invalid transactions",
          description: "Could not parse any valid transactions from your description",
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
      let errorMessage = "Failed to parse transactions";
      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          errorMessage = "Too many requests. Please wait a moment and try again.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication error. Please sign in again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive", });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async (transactions: ParsedTransaction[], newCategoriesToCreate: CategoryBudget[]) => {
    if (transactions.length === 0) {
      toast({
        title: "Error",
        description: "No transactions to save",
        variant: "destructive",
      });
      return;
    }

    // Check if we have sufficient budget
    const totalBudgetNeeded = newCategoriesToCreate.reduce((sum, cat) => sum + cat.budgeted, 0);
    if (totalBudgetNeeded > availableBudget) {
      toast({
        title: "Insufficient Budget",
        description: `You need $${totalBudgetNeeded.toFixed(2)} but only have $${availableBudget.toFixed(2)} available. Please adjust your category allocations.`,
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
          title: "Creating categories...",
          description: `Creating ${newCategoriesToCreate.length} new categor${newCategoriesToCreate.length === 1 ? 'y' : 'ies'} with budget allocations...`,
        });

        for (const categoryData of newCategoriesToCreate) {
          try {
            const newCategory = await createCategory.mutateAsync(categoryData);
            createdCategories.set(categoryData.name.toLowerCase(), newCategory);
          } catch (error) {
            console.error(`Failed to create category ${categoryData.name}:`, error);
            toast({
              title: "Error",
              description: `Failed to create category "${categoryData.name}"`,
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
          title: "Success",
          description: `Saved ${successful} transaction(s)${failed > 0 ? `, ${failed} failed` : ''}${newCategoriesToCreate.length > 0 ? ` and created ${newCategoriesToCreate.length} categor${newCategoriesToCreate.length === 1 ? 'y' : 'ies'}` : ''}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save any transactions. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Reset form
      setDescription("");
      setParsedTransactions([]);
      setMissingCategories([]);
      setIsOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
    } catch (error) {
      console.error("Failed to save transactions:", error);
      
      let errorMessage = "Failed to save transactions";
      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication error. Please sign in again.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("category")) {
          errorMessage = "Category not found. Please check your budget categories.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
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
      
      {/* Sleek Command Bar Interface */}
      <div className="relative group w-full transition-all duration-300 mb-6">
        <div className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 ${isParsing ? 'bg-gradient-to-r from-accent via-purple-500 to-pink-500 animate-pulse' : 'bg-gradient-to-r from-accent/50 to-purple-500/50'}`}></div>
        
        <div className="relative flex flex-col sm:flex-row items-center bg-card text-card-foreground border border-border/50 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          
          <div className="pl-4 py-3 flex items-center justify-center text-accent hidden sm:flex">
             <Sparkles className={`h-5 w-5 ${isParsing ? 'animate-spin text-purple-400' : 'animate-pulse'}`} />
          </div>

          <Textarea
            placeholder={t('aiExample')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isParsing || isLoadingCategories || categories?.length === 0}
            className="flex-1 border-0 focus-visible:ring-0 resize-none min-h-[60px] max-h-[150px] bg-transparent p-4 text-base shadow-none focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            rows={1}
            style={{ 
               fieldSizing: 'content' 
            } as any}
          />
          
          <div className="p-2 sm:pr-3 sm:pl-1 w-full sm:w-auto flex justify-end bg-card">
            <Button
              onClick={handleParse}
              disabled={!description.trim() || isParsing || isLoadingCategories || categories?.length === 0}
              className={`rounded-xl px-6 h-10 transition-all duration-300 ${!description.trim() ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(var(--accent),0.5)] hover:scale-105'}`}
            >
              {isParsing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <span className="font-bold tracking-wide">{t('transformWithAI')}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between px-2 -mt-4 mb-4 text-xs text-muted-foreground/60">
        <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Press Enter to add magic</span>
        {categories?.length === 0 && !isLoadingCategories && (
          <span className="text-destructive/80 font-medium">Categories setup required first!</span>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto border-accent/20">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> {t('reviewTransactions')}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Review the parsed transactions and set budget allocations for new categories.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
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