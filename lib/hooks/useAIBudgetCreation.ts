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
    mutationFn: async (data: CreateCategoryData & { budgetId?: string }) => {
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
      
      // Create a completely new budget with unique sections
      const uniqueSections = aiData.sections.map(section => ({
        name: `${section.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // Make section names completely unique
      }));
      
      const budgetData: CreateBudgetData = {
        user: userIdQuery.data!,
        month,
        year,
        sections: uniqueSections,
        totalBudgeted: 0, // Start with 0 budgeted, will be updated after categories are created
        totalAvailable: aiData.income, // All income is available to budget
      };

      const budget = await createBudget.mutateAsync(budgetData);
      
      console.log('Created new budget:', {
        budgetId: budget._id,
        sections: budget.sections,
        totalAvailable: budget.totalAvailable
      });
      
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

      const categoryPromises = aiData.categories.map(async (category, index) => {
        // Use the corresponding unique section from the budget
        const sectionName = budget.sections[index]?.name;
        
        // Edge case: Handle missing section
        if (!sectionName) {
          throw new Error(`Category "${category.name}" references a section that doesn't exist.`);
        }
        
        console.log('Creating category for new budget:', {
          categoryName: category.name,
          budgeted: category.amount,
          sectionName: sectionName,
          budgetId: budget._id,
          sectionIndex: index
        });
        
        const categoryData: CreateCategoryData & { budgetId: string } = {
          name: category.name,
          budgeted: category.amount,
          spent: 0,
          sectionId: sectionName, // Use the exact unique section name
          budgetId: budget._id, // Pass the specific budget ID
        };

        return createCategory.mutateAsync(categoryData);
      });

      const createdCategories = await Promise.all(categoryPromises);
      
      // Edge case: Validate all categories were created
      if (createdCategories.length !== aiData.categories.length) {
        throw new Error('Some categories failed to create. Please try again.');
      }

      // Update budget totals after categories are created
      const totalBudgeted = createdCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
      const totalAvailable = aiData.income - totalBudgeted;
      
      // Update the budget with the new totals
      await fetch(`/api/budgets/${budget._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudgeted: totalBudgeted,
          totalAvailable: totalAvailable,
        }),
      });
      
      console.log('AI Budget Creation Complete:', {
        budgetId: budget._id,
        totalBudgeted,
        totalAvailable,
        categoriesCreated: createdCategories.length
      });

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