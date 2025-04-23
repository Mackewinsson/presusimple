import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryId?: string;
  createdAt: string;
}

interface SavingsGoalState {
  goals: SavingsGoal[];
}

const initialState: SavingsGoalState = {
  goals: [],
};

const savingsGoalSlice = createSlice({
  name: 'savingsGoals',
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<{
      name: string;
      targetAmount: number;
      deadline?: string;
      categoryId?: string;
    }>) => {
      const newGoal: SavingsGoal = {
        id: uuidv4(),
        currentAmount: 0,
        createdAt: new Date().toISOString(),
        ...action.payload,
      };
      state.goals.push(newGoal);
    },
    
    updateGoalProgress: (state, action: PayloadAction<{
      id: string;
      amount: number;
    }>) => {
      const goal = state.goals.find(g => g.id === action.payload.id);
      if (goal) {
        goal.currentAmount = Math.min(goal.targetAmount, goal.currentAmount + action.payload.amount);
      }
    },
    
    deleteGoal: (state, action: PayloadAction<{ id: string }>) => {
      state.goals = state.goals.filter(goal => goal.id !== action.payload.id);
    },
  },
});

export const { addGoal, updateGoalProgress, deleteGoal } = savingsGoalSlice.actions;
export default savingsGoalSlice.reducer;