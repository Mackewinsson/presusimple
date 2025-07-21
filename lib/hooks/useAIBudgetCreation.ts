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
    // Edge case: Validate inputs
    if (!description || description.trim().length < 10) {
      throw new Error('Please provide a more detailed budget description (at least 10 characters)');
    }

    if (!userIdQuery.data) {
      throw new Error('User not authenticated. Please sign in again.');
    }

    if (month < 1 || month > 12) {
      throw new Error('Invalid month. Please select a month between 1 and 12.');
    }

    if (year < 2020 || year > 2030) {
      throw new Error('Invalid year. Please select a year between 2020 and 2030.');
    }

    setIsProcessing(true);
    setCurrentStep("extracting");
    
    try {
      // Step 1: Extract data with AI (add delay to show animation)
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      const aiData = await extractBudgetData.mutateAsync(description);
      
      // Edge case: Validate AI response
      if (!aiData || !aiData.income || aiData.income <= 0) {
        throw new Error('Unable to extract income from your description. Please try being more specific about your income.');
      }

      if (!aiData.categories || aiData.categories.length === 0) {
        throw new Error('Unable to extract budget categories from your description. Please try being more specific about your expenses.');
      }

      // Edge case: Check for duplicate categories
      const categoryNames = aiData.categories.map(cat => cat.name.toLowerCase());
      const uniqueNames = new Set(categoryNames);
      if (uniqueNames.size !== categoryNames.length) {
        throw new Error('Duplicate categories detected. Please provide unique category names.');
      }

      // Edge case: Validate category amounts
      const totalCategories = aiData.categories.reduce((sum, cat) => sum + cat.amount, 0);
      if (totalCategories > aiData.income * 1.1) { // Allow 10% tolerance
        throw new Error('Total expenses exceed income. Please check your budget amounts.');
      }

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
      
      // Edge case: Validate budget creation
      if (!budget || !budget._id) {
        throw new Error('Failed to create budget. Please try again.');
      }

      setCurrentStep("saving");
      
      // Step 3: Create the categories (add delay to show animation)
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      
      // Edge case: Validate sections exist
      if (!budget.sections || budget.sections.length === 0) {
        throw new Error('Budget created but no sections found. Please try again.');
      }

      const categoryPromises = aiData.categories.map(async (category) => {
        // Find the corresponding sectionId
        const sectionIndex = aiData.sections.findIndex(s => s.name === category.sectionName);
        
        // Edge case: Handle missing section
        if (sectionIndex === -1) {
          throw new Error(`Category "${category.name}" references a section that doesn't exist.`);
        }
        
        const sectionId = budget.sections[sectionIndex]._id;
        
        // Edge case: Validate sectionId
        if (!sectionId) {
          throw new Error(`Invalid section ID for category "${category.name}".`);
        }
        
        const categoryData: CreateCategoryData = {
          name: category.name,
          budgeted: category.amount,
          spent: 0,
          sectionId,
        };

        return createCategory.mutateAsync(categoryData);
      });

      const createdCategories = await Promise.all(categoryPromises);
      
      // Edge case: Validate all categories were created
      if (createdCategories.length !== aiData.categories.length) {
        throw new Error('Some categories failed to create. Please try again.');
      }

      setCurrentStep("complete");
      
      // Show completion for a moment before finishing
      await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 second delay
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      
      return budget;
    } catch (error) {
      console.error('Error creating budget from AI:', error);
      
      // Edge case: Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        if (error.message.includes('OpenAI')) {
          throw new Error('AI service temporarily unavailable. Please try again in a moment.');
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new Error('Authentication error. Please sign in again.');
        }
        if (error.message.includes('500')) {
          throw new Error('Server error. Please try again later.');
        }
        throw error; // Re-throw the original error if it's already user-friendly
      }
      
      throw new Error('An unexpected error occurred. Please try again.');
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