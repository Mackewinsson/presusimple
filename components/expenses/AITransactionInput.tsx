"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, CheckCircle, XCircle } from "lucide-react";
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
      <div className="text-sm text-muted-foreground">
        Review the transactions before saving:
      </div>
      
      <div className="space-y-3">
        {transactions.map((transaction, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
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
    <Card className="glass-card hover-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Quick Transaction Input
        </CardTitle>
        <CardDescription>
          Describe your transactions in natural language and let AI parse them for you
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
            disabled={!description.trim() || isParsing}
            className="flex-1"
          >
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Parsing...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Parse Transactions
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Examples:</p>
          <ul className="space-y-1">
            <li>• "coffee 5, lunch 15" → Two food expenses</li>
            <li>• "rent 500, gas 40" → Rent and transportation</li>
            <li>• "salary 2000, freelance 500" → Two income sources</li>
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