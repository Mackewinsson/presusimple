"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, CheckCircle, XCircle, Sparkles, Zap, AlertTriangle, DollarSign, AlertCircle } from "lucide-react";
import { AITransactionLoading } from "@/components/ui/ai-transaction-loading";
import { useToast } from "@/hooks/use-toast";
import { useUserId } from "@/lib/hooks/useUserId";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    console.log('Changing category for transaction', transactionIndex, 'to', newCategory);
    console.log('Available categories:', availableCategories.map(cat => cat.name));
    console.log('Current category changes:', categoryChanges);
    setCategoryChanges(prev => {
      const newChanges = { ...prev, [transactionIndex]: newCategory };
      console.log('New category changes:', newChanges);
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
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-white animate-pulse" />
        <span>AI found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}!</span>
      </div>
      
      {/* Budget Summary */}
      <div className="p-3 border border-blue-500/30 rounded-lg bg-blue-500/10">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-blue-300">Available Budget</span>
          <span className="font-mono text-blue-300">${availableBudget.toFixed(2)}</span>
        </div>
        {newCategoriesToCreate.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Budget needed for new categories:</span>
            <span className={`font-mono ${hasInsufficientBudget ? 'text-red-400' : 'text-green-400'}`}>
              ${totalBudgetNeeded.toFixed(2)}
            </span>
          </div>
        )}
        {hasInsufficientBudget && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Insufficient budget. Please adjust category allocations or cancel.</span>
          </div>
        )}
      </div>
      
      {/* Missing Categories Section */}
      {missingCategories.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">New Categories Found</span>
          </div>
          <div className="text-sm text-muted-foreground">
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
                    ? 'border-amber-500/50 bg-amber-500/10' 
                    : 'border-amber-500/30 bg-amber-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-amber-300">{missingCategory.name}</span>
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
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-md" 
                        : "bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 hover:from-slate-500 hover:to-slate-600"
                    } transition-all duration-200 transform hover:scale-105`}
                  >
                    {isSelected ? "Will Create" : "Create Category"}
                  </Button>
                </div>
                
                {isSelected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`budget-${index}`} className="text-sm text-muted-foreground">
                        Budget Allocation:
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`budget-${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetAmount}
                          onChange={(e) => handleBudgetChange(missingCategory.name, parseFloat(e.target.value) || 0)}
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
      <div className="space-y-3">
        <div className="text-sm font-medium text-white">Transactions to Save:</div>
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
              className={`p-3 border rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-left-2 ${
                isMissingCategory ? 'border-amber-500/50 bg-amber-500/5' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>Category:</span>
                    <Select value={currentCategory} onValueChange={(value) => handleCategoryChange(index, value)}>
                      <SelectTrigger className="w-40 h-8 text-xs">
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
                      <Badge variant="outline" className="text-amber-300 border-amber-300">
                        New Category
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
                  <span>Suggestions: </span>
                  <span className="text-green-300">(Debug: {transaction.suggestedCategories.length} suggestions)</span>
                  {transaction.suggestedCategories
                    .filter(suggestion => availableCategories.some(cat => cat.name === suggestion))
                    .map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          console.log('Clicking suggestion:', suggestion);
                          handleCategoryChange(index, suggestion);
                        }}
                        className="text-blue-300 hover:text-blue-200 underline mr-2"
                      >
                        {suggestion}
                      </button>
                    ))}
                  {transaction.suggestedCategories.filter(suggestion => 
                    !availableCategories.some(cat => cat.name === suggestion)
                  ).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>Better categories to add: </span>
                      {transaction.suggestedCategories
                        .filter(suggestion => !availableCategories.some(cat => cat.name === suggestion))
                        .map((suggestion, i) => (
                          <span key={i} className="text-amber-300 mr-2">
                            {suggestion}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleConfirm}
          disabled={isSaving || hasInsufficientBudget}
          className={`flex-1 ${
            hasInsufficientBudget 
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white opacity-50 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl"
          } transition-all duration-300 transform hover:scale-[1.02] border-0`}
        >
          {isSaving ? "Saving..." : `Save Transactions${newCategoriesToCreate.length > 0 ? ` & Create ${newCategoriesToCreate.length} Categor${newCategoriesToCreate.length === 1 ? 'y' : 'ies'}` : ''}`}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="bg-gradient-to-r from-slate-600 to-slate-700 text-white border-0 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 transform hover:scale-105"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export const AITransactionInput = ({ budgetId }: { budgetId: string }) => {
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
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load categories when component mounts
  const loadCategories = async () => {
    if (!budgetId) {
      console.error('No budgetId provided');
      return;
    }
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`/api/categories?budget=${budgetId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Budget not found');
        } else if (response.status === 401) {
          throw new Error('Authentication required');
        } else {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }
      }
      const categoriesData = await response.json();
      if (!Array.isArray(categoriesData)) {
        throw new Error('Invalid categories data received');
      }
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load budget categories",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Load budget data to get available budget
  const loadBudget = async () => {
    if (!budgetId) return;
    
    try {
      const response = await fetch(`/api/budgets/${budgetId}`);
      if (response.ok) {
        const budgetData = await response.json();
        setAvailableBudget(budgetData.totalAvailable || 0);
      }
    } catch (error) {
      console.error('Failed to load budget data:', error);
    }
  };

  React.useEffect(() => {
    if (budgetId) {
      loadCategories();
      loadBudget();
    }
  }, [budgetId]);

  const parseTransactions = useMutation({
    mutationFn: async (description: string) => {
      const categoryNames = categories.map(cat => cat.name);
      console.log('Sending categories to AI:', categoryNames);
      
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
      console.log('AI parsing result:', result);
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
      const matchingCategory = categories.find((cat: any) => 
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

    // Check if categories are loaded
    if (categories.length === 0) {
      toast({
        title: "Error",
        description: "No categories available. Please set up your budget categories first.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting AI parsing with categories:', categories.map(cat => cat.name));

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

    if (categories.length === 0) {
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
        const matchingCategory = categories.find((cat: any) => 
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
        await loadCategories();
        // Reload budget to get updated available amount
        await loadBudget();
      }

      // Step 2: Save all transactions
      const results = await Promise.allSettled(
        transactions.map(async (transaction) => {
          // Find matching category (existing or newly created)
          let matchingCategory = categories.find((cat: any) => 
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

  return (
    <>
      <AITransactionLoading isProcessing={isParsing} currentStep={currentStep} />
      <Card className="glass-card hover-card group bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 border border-purple-500/20 shadow-2xl">
        <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping" />
          </div>
          <span className="text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text font-bold">
            AI Magic
          </span>
          <Zap className="h-5 w-5 text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text animate-bounce" />
        </CardTitle>
          <CardDescription className="text-base">
            Just describe your day in plain English and watch AI transform it into perfect budget entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Example: coffee 5, lunch 15, gas 40, salary 2000"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
              disabled={isParsing}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{description.length}/500 characters</span>
              <span>{description.length < 3 ? 'Need more detail' : 'Ready to parse'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleParse}
              disabled={!description.trim() || isParsing || isLoadingCategories || categories.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-0"
            >
              {isParsing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span className="animate-pulse">AI is working...</span>
                </>
              ) : isLoadingCategories ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span>Loading categories...</span>
                </>
              ) : categories.length === 0 ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  <span>No categories available</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                  <span>✨ Transform with AI</span>
                </>
              )}
            </Button>
          </div>

          {categories.length === 0 && !isLoadingCategories && (
            <div className="text-xs text-muted-foreground bg-white/10 p-3 rounded-lg">
              <p className="font-medium mb-1">Setup Required</p>
              <p>You need to create budget categories first. Go to Budget Setup to add categories.</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-white" />
              Try these examples:
            </p>
            <ul className="space-y-1">
              <li className="hover:text-white transition-colors cursor-pointer">• "coffee 5, lunch 15" → Two food expenses</li>
              <li className="hover:text-white transition-colors cursor-pointer">• "rent 500, gas 40" → Rent and transportation</li>
              <li className="hover:text-white transition-colors cursor-pointer">• "salary 2000, freelance 500" → Two income sources</li>
            </ul>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Review Transactions</DialogTitle>
                <DialogDescription>
                  Review the parsed transactions and set budget allocations for new categories.
                </DialogDescription>
              </DialogHeader>

              <TransactionPreview
                transactions={parsedTransactions}
                missingCategories={missingCategories}
                availableBudget={availableBudget}
                availableCategories={categories} // Pass available categories to the preview
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}; 