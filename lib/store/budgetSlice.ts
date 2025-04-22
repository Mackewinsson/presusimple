import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
}

export interface BudgetSection {
  id: string;
  name: string;
}

interface BudgetState {
  sections: BudgetSection[];
  categories: BudgetCategory[];
  totalBudgeted: number;
  totalSpent: number;
  totalAvailable: number;
}

const initialState: BudgetState = {
  sections: [],
  categories: [],
  totalBudgeted: 0,
  totalSpent: 0,
  totalAvailable: 0,
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setTotalAvailable: (state, action: PayloadAction<number>) => {
      state.totalAvailable = action.payload;
    },
    
    addSection: (state, action: PayloadAction<{ name: string }>) => {
      const newSection = {
        id: uuidv4(),
        name: action.payload.name,
      };
      state.sections.push(newSection);
    },
    
    removeSection: (state, action: PayloadAction<{ id: string }>) => {
      // Remove the section
      state.sections = state.sections.filter(section => section.id !== action.payload.id);
      
      // Get all categories that belong to this section
      const categoriesToRemove = state.categories.filter(
        category => category.sectionId === action.payload.id
      );
      
      // Update total available
      state.totalAvailable += categoriesToRemove.reduce(
        (sum, category) => sum + category.budgeted, 0
      );
      
      // Reduce the total budgeted amount
      state.totalBudgeted = state.totalBudgeted - categoriesToRemove.reduce(
        (sum, category) => sum + category.budgeted, 0
      );
      
      // Reduce the total spent amount
      state.totalSpent = state.totalSpent - categoriesToRemove.reduce(
        (sum, category) => sum + category.spent, 0
      );
      
      // Remove all categories that belong to this section
      state.categories = state.categories.filter(
        category => category.sectionId !== action.payload.id
      );
    },
    
    addCategory: (state, action: PayloadAction<{ 
      name: string; 
      budgeted: number; 
      sectionId: string;
    }>) => {
      const { name, budgeted, sectionId } = action.payload;
      
      // Check if we have enough available budget
      if (budgeted > state.totalAvailable) {
        return;
      }
      
      const newCategory = {
        id: uuidv4(),
        name,
        budgeted,
        spent: 0,
        sectionId,
      };
      
      state.categories.push(newCategory);
      state.totalBudgeted += budgeted;
      state.totalAvailable -= budgeted;
    },
    
    removeCategory: (state, action: PayloadAction<{ id: string }>) => {
      const categoryToRemove = state.categories.find(
        category => category.id === action.payload.id
      );
      
      if (categoryToRemove) {
        state.totalBudgeted -= categoryToRemove.budgeted;
        state.totalSpent -= categoryToRemove.spent;
        state.totalAvailable += categoryToRemove.budgeted;
        state.categories = state.categories.filter(
          category => category.id !== action.payload.id
        );
      }
    },
    
    updateCategory: (state, action: PayloadAction<{ 
      id: string; 
      name?: string; 
      budgeted?: number;
    }>) => {
      const { id, name, budgeted } = action.payload;
      const category = state.categories.find(c => c.id === id);
      
      if (category) {
        if (name !== undefined) {
          category.name = name;
        }
        
        if (budgeted !== undefined) {
          const budgetDiff = budgeted - category.budgeted;
          
          // Check if we have enough available budget for the increase
          if (budgetDiff > state.totalAvailable) {
            return;
          }
          
          state.totalBudgeted = state.totalBudgeted - category.budgeted + budgeted;
          state.totalAvailable -= budgetDiff;
          category.budgeted = budgeted;
        }
      }
    },
    
    addExpenseToCategory: (state, action: PayloadAction<{ 
      categoryId: string; 
      amount: number;
    }>) => {
      const { categoryId, amount } = action.payload;
      const category = state.categories.find(c => c.id === categoryId);
      
      if (category) {
        category.spent += amount;
        state.totalSpent += amount;
      }
    },
    
    resetBudget: (state) => {
      // Reset all categories spent to 0
      state.categories.forEach(category => {
        category.spent = 0;
      });
      
      // Reset total spent
      state.totalSpent = 0;
    },
    
    resetAll: () => initialState,
  },
});

export const { 
  setTotalAvailable,
  addSection, 
  removeSection, 
  addCategory, 
  removeCategory, 
  updateCategory, 
  addExpenseToCategory, 
  resetBudget,
  resetAll,
} = budgetSlice.actions;

export default budgetSlice.reducer;