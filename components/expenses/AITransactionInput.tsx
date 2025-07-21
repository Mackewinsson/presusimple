"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, CheckCircle, XCircle, Sparkles, Zap } from "lucide-react";
import { AITransactionLoading } from "@/components/ui/ai-transaction-loading";
import { useToast } from "@/hooks/use-toast";
import { useUserId } from "@/lib/hooks/useUserId";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ParsedTransaction {
  description: string;
  amount: number;
  type: "expense" | "income";
  category: string;
}

interface TransactionPreviewProps {
  transactions: ParsedTransaction[];
  onConfirm: (transactions: ParsedTransaction[]) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const TransactionPreview = ({ transactions, onConfirm, onCancel, isSaving }: TransactionPreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-white animate-pulse" />
        <span>AI found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}!</span>
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] animate-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex-1">
              <div className="font-medium">{transaction.description}</div>
              <div className="text-sm text-muted-foreground">{transaction.category}</div>
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
        ))}
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button
          onClick={() => onConfirm(transactions)}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? "Saving..." : "Save Transactions"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
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

  // Load categories on mount
  React.useEffect(() => {
    if (budgetId) {
      loadCategories();
    }
  }, [budgetId]);

  const parseTransactions = useMutation({
    mutationFn: async (description: string) => {
      const response = await fetch('/api/transactions/ai-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          userId: userId?.data, // Extract the actual user ID string
          budgetId,
          categories: categories.map(cat => cat.name) // Pass available categories
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to parse transactions');
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
          description: "AI couldn't identify any transactions. Try being more specific.",
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
          description: "AI parsed transactions but they were invalid. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Step 4: Complete
      setCurrentStep("complete");
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (parsedTransactions.length === 0) {
      toast({
        title: "Error",
        description: "No transactions to save",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Save all transactions with error handling for each
      const results = await Promise.allSettled(
        parsedTransactions.map(transaction => saveExpense.mutateAsync(transaction))
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        toast({
          title: "Success",
          description: `Saved ${successful} transaction(s)${failed > 0 ? `, ${failed} failed` : ''}`,
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
      setIsOpen(false);
      
      // Refresh expenses
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
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
    setIsOpen(false);
  };

  return (
    <>
      <AITransactionLoading isProcessing={isParsing} currentStep={currentStep} />
      <Card className="glass-card hover-card group">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
          </div>
          <span className="text-white">
            AI Magic
          </span>
          <Zap className="h-5 w-5 text-white animate-bounce" />
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
            className="flex-1 btn-primary"
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
      </CardContent>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Transactions</DialogTitle>
            <DialogDescription>
              Review the parsed transactions before saving them to your budget.
            </DialogDescription>
          </DialogHeader>
          
          <TransactionPreview
            transactions={parsedTransactions}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </Card>
    </>
  );
}; 