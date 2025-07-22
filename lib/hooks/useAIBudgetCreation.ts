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

interface CategoryGroup {
  sectionName: string;
  categories: AICategory[];
}

// Function to group categories into logical sections
function groupCategoriesIntoSections(categories: AICategory[]): CategoryGroup[] {
  const housingKeywords = ['rent', 'mortgage', 'housing', 'home', 'utilities', 'electricity', 'water', 'gas', 'internet', 'wifi'];
  const foodKeywords = ['food', 'groceries', 'dining', 'restaurant', 'meals', 'lunch', 'dinner', 'breakfast'];
  const transportKeywords = ['transport', 'gas', 'fuel', 'car', 'uber', 'lyft', 'taxi', 'bus', 'train', 'subway', 'parking'];
  const entertainmentKeywords = ['entertainment', 'movies', 'games', 'hobbies', 'sports', 'gym', 'fitness', 'netflix', 'spotify'];
  const savingsKeywords = ['savings', 'emergency', 'investment', 'retirement', '401k', 'ira'];
  const healthcareKeywords = ['health', 'medical', 'insurance', 'doctor', 'dental', 'pharmacy', 'medicine'];
  const personalKeywords = ['personal', 'clothing', 'shopping', 'beauty', 'hair', 'cosmetics', 'grooming'];
  
  const groups: CategoryGroup[] = [];
  const processedCategories = new Set<string>();
  
  // Helper function to check if category matches keywords
  function matchesKeywords(categoryName: string, keywords: string[]): boolean {
    return keywords.some(keyword => 
      categoryName.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  // Helper function to assign category to group
  function assignToGroup(category: AICategory, sectionName: string) {
    let group = groups.find(g => g.sectionName === sectionName);
    if (!group) {
      group = { sectionName, categories: [] };
      groups.push(group);
    }
    group.categories.push(category);
    processedCategories.add(category.name.toLowerCase());
  }
  
  // Process each category
  categories.forEach(category => {
    const categoryName = category.name.toLowerCase();
    
    if (matchesKeywords(categoryName, housingKeywords)) {
      assignToGroup(category, 'Housing');
    } else if (matchesKeywords(categoryName, foodKeywords)) {
      assignToGroup(category, 'Food & Dining');
    } else if (matchesKeywords(categoryName, transportKeywords)) {
      assignToGroup(category, 'Transportation');
    } else if (matchesKeywords(categoryName, entertainmentKeywords)) {
      assignToGroup(category, 'Entertainment');
    } else if (matchesKeywords(categoryName, savingsKeywords)) {
      assignToGroup(category, 'Savings & Investment');
    } else if (matchesKeywords(categoryName, healthcareKeywords)) {
      assignToGroup(category, 'Healthcare');
    } else if (matchesKeywords(categoryName, personalKeywords)) {
      assignToGroup(category, 'Personal Care');
    } else {
      // Default group for uncategorized items
      assignToGroup(category, 'Other Expenses');
    }
  });
  
  return groups;
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
      
      console.log('AI Response Data:', {
        income: aiData.income,
        sections: aiData.sections,
        categories: aiData.categories,
        categoriesLength: aiData.categories?.length
      });
      
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
      
      // Create a completely new budget with intelligent section names
      // Group categories into logical sections based on their names
      const sectionGroups = groupCategoriesIntoSections(aiData.categories);
      
      // Create sections with clean display names and unique identifiers
      const uniqueSections = sectionGroups.map((group, index) => {
        const displayName = group.sectionName;
        
        // Generate a unique identifier using timestamp and random string
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const uniqueId = `${timestamp}_${randomString}`;
        
        // Use unique identifier in the name for internal uniqueness
        const uniqueName = `${displayName}_${uniqueId}`;
        
        return { 
          name: uniqueName,
          displayName: displayName,
          uniqueId: uniqueId
        };
      });
      
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
        totalAvailable: budget.totalAvailable,
        sectionsLength: budget.sections?.length
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

      // Create categories for each group
      const categoryPromises: Promise<any>[] = [];
      
      sectionGroups.forEach((group, groupIndex) => {
        group.categories.forEach((category) => {
          const section = budget.sections[groupIndex];
          
          // Edge case: Handle missing section
          if (!section) {
            console.error('Missing section for category:', {
              categoryName: category.name,
              budgetSections: budget.sections,
              groupIndex: groupIndex
            });
            throw new Error(`Category "${category.name}" references a section that doesn't exist.`);
          }
          
          console.log('Creating category for new budget:', {
            categoryName: category.name,
            budgeted: category.amount,
            sectionName: section.name,
            budgetId: budget._id,
            groupIndex: groupIndex,
            sectionGroup: group.sectionName,
            totalSections: budget.sections.length,
            totalCategories: aiData.categories.length
          });
          
          const categoryData: CreateCategoryData & { budgetId: string } = {
            name: category.name,
            budgeted: category.amount,
            spent: 0,
            sectionId: section.name, // Use the clean section name for display
            budgetId: budget._id, // Pass the specific budget ID
          };

          categoryPromises.push(createCategory.mutateAsync(categoryData));
        });
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