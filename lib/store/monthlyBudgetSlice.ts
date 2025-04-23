import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { BudgetCategory, BudgetSection } from './budgetSlice';
import { Expense } from './expenseSlice';

export interface MonthlyBudget {
  id: string;
  name: string;
  date: string;
  sections: BudgetSection[];
  categories: BudgetCategory[];
  expenses: Expense[];
  totalBudgeted: number;
  totalSpent: number;
}

interface MonthlyBudgetState {
  budgets: MonthlyBudget[];
}

const initialState: MonthlyBudgetState = {
  budgets: [],
};

const monthlyBudgetSlice = createSlice({
  name: 'monthlyBudgets',
  initialState,
  reducers: {
    saveBudget: (state, action: PayloadAction<{ 
      name: string;
      sections: BudgetSection[];
      categories: BudgetCategory[];
      expenses: Expense[];
      totalBudgeted: number;
      totalSpent: number;
    }>) => {
      const newBudget: MonthlyBudget = {
        id: uuidv4(),
        date: new Date().toISOString(),
        ...action.payload,
      };
      state.budgets.push(newBudget);
    },
    
    deleteBudget: (state, action: PayloadAction<{ id: string }>) => {
      state.budgets = state.budgets.filter(budget => budget.id !== action.payload.id);
    },
  },
});

export const { saveBudget, deleteBudget } = monthlyBudgetSlice.actions;
export default monthlyBudgetSlice.reducer;