"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, CheckCircle, XCircle, Sparkles, Zap } from "lucide-react";
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
        <CheckCircle className="h-4 w-4 text-green-500 animate-pulse" />
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
  
  const { toast } = useToast();
  const userId = useUserId();
  const queryClient = useQueryClient();

  // Fetch categories for this budget
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Load categories when component mounts
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await fetch(`/api/categories?budget=${budgetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categoriesData = await response.json();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast({
        title: "Error",
        description: "Failed to load budget categories",
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
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a transaction description",
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

    setIsParsing(true);
    try {
      const result = await parseTransactions.mutateAsync(description);
      setParsedTransactions(result.transactions);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to parse transactions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to parse transactions",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Save all transactions
      const savePromises = parsedTransactions.map(transaction => 
        saveExpense.mutateAsync(transaction)
      );
      
      await Promise.all(savePromises);
      
      toast({
        title: "Success",
        description: `Saved ${parsedTransactions.length} transaction(s)`,
      });
      
      // Reset form
      setDescription("");
      setParsedTransactions([]);
      setIsOpen(false);
      
      // Refresh expenses
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
    } catch (error) {
      console.error("Failed to save transactions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save transactions",
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
    <Card className="glass-card hover-card group">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AI Magic
          </span>
          <Zap className="h-5 w-5 text-yellow-500 animate-bounce" />
        </CardTitle>
        <CardDescription className="text-base">
          ✨ Just describe your day in plain English and watch AI transform it into perfect budget entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Example: coffee 5, lunch 15, gas 40, salary 2000"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300"
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
            disabled={!description.trim() || isParsing}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                <span className="animate-pulse">AI is working...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                <span>✨ Transform with AI</span>
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-purple-500" />
            Try these examples:
          </p>
          <ul className="space-y-1">
            <li className="hover:text-purple-500 transition-colors cursor-pointer">• "coffee 5, lunch 15" → Two food expenses</li>
            <li className="hover:text-purple-500 transition-colors cursor-pointer">• "rent 500, gas 40" → Rent and transportation</li>
            <li className="hover:text-purple-500 transition-colors cursor-pointer">• "salary 2000, freelance 500" → Two income sources</li>
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
  );
}; 