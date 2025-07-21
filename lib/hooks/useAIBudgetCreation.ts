import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserId } from './useUserId';

type AIStep = "extracting" | "creating" | "saving" | "complete";

interface AICategory {
  name: string;
  amount: number;
  sectionName: string;
}

interface AIBudgetResponse {
  income: number;
  sections: Array<{ name: string }>;
  categories: AICategory[];
}

interface CreateBudgetData {
  user: string;
  month: number;
  year: number;
  sections: Array<{ name: string }>;
  totalBudgeted: number;
  totalAvailable: number;
}

interface CreateCategoryData {
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

export const useAIBudgetCreation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<AIStep>("extracting");
  const userIdQuery = useUserId();
  const queryClient = useQueryClient();

  const extractBudgetData = useMutation({
    mutationFn: async (description: string): Promise<AIBudgetResponse> => {
      const response = await fetch('/api/budgets/ai-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, userId: userIdQuery.data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to extract budget data');
      }

      return response.json();
    },
  });

  const createBudget = useMutation({
    mutationFn: async (data: CreateBudgetData) => {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create budget');
      }

      return response.json();
    },
  });

  const createCategory = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      return response.json();
    },
  });

  const createBudgetFromAI = async (description: string, month: number, year: number) => {
    setIsProcessing(true);
    setCurrentStep("extracting");
    
    try {
      // Step 1: Extract data with AI (add delay to show animation)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      const aiData = await extractBudgetData.mutateAsync(description);
      setCurrentStep("creating");
      
      // Step 2: Create the budget (add delay to show animation)
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
      const budgetData: CreateBudgetData = {
        user: userIdQuery.data!,
        month,
        year,
        sections: aiData.sections,
        totalBudgeted: aiData.income, // All income is budgeted to categories
        totalAvailable: 0, // No money left to budget since all is allocated
      };

      const budget = await createBudget.mutateAsync(budgetData);
      setCurrentStep("saving");
      
      // Step 3: Create the categories (add delay to show animation)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      const categoryPromises = aiData.categories.map(async (category) => {
        // Find the corresponding sectionId
        const sectionIndex = aiData.sections.findIndex(s => s.name === category.sectionName);
        const sectionId = budget.sections[sectionIndex]._id;
        
        const categoryData: CreateCategoryData = {
          name: category.name,
          budgeted: category.amount,
          spent: 0,
          sectionId,
        };

        return createCategory.mutateAsync(categoryData);
      });

      await Promise.all(categoryPromises);
      setCurrentStep("complete");
      
      // Show completion for a moment before finishing
      await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 second delay
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      return budget;
    } catch (error) {
      console.error('Error creating budget from AI:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setCurrentStep("extracting");
    }
  };

  return {
    createBudgetFromAI,
    isProcessing,
    currentStep,
    isExtracting: extractBudgetData.isPending,
    isCreatingBudget: createBudget.isPending,
    isCreatingCategories: createCategory.isPending,
    error: extractBudgetData.error || createBudget.error || createCategory.error,
  };
}; 