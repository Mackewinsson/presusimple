import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  type: TransactionType;
}

interface ExpenseState {
  expenses: Expense[];
}

const initialState: ExpenseState = {
  expenses: [],
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<{ 
      amount: number; 
      description: string; 
      categoryId: string;
      date: string;
      type: TransactionType;
    }>) => {
      const { amount, description, categoryId, date, type } = action.payload;
      
      const newExpense: Expense = {
        id: uuidv4(),
        amount,
        description,
        categoryId,
        date,
        type,
      };
      
      state.expenses.push(newExpense);
    },
    
    updateExpense: (state, action: PayloadAction<{
      id: string;
      amount?: number;
      description?: string;
      categoryId?: string;
      date?: string;
      type?: TransactionType;
    }>) => {
      const { id, ...updates } = action.payload;
      const expense = state.expenses.find(e => e.id === id);
      
      if (expense) {
        Object.assign(expense, updates);
      }
    },
    
    removeExpense: (state, action: PayloadAction<{ id: string }>) => {
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload.id);
    },
    
    clearExpenses: (state) => {
      state.expenses = [];
    },
    
    resetAll: () => initialState,
  },
});

export const { 
  addExpense,
  updateExpense,
  removeExpense, 
  clearExpenses, 
  resetAll 
} = expenseSlice.actions;

export default expenseSlice.reducer;