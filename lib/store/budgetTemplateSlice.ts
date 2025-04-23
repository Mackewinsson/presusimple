import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { BudgetCategory, BudgetSection } from './budgetSlice';

export interface BudgetTemplate {
  id: string;
  name: string;
  sections: BudgetSection[];
  categories: BudgetCategory[];
  isDefault?: boolean;
}

interface BudgetTemplateState {
  templates: BudgetTemplate[];
}

const defaultTemplates: BudgetTemplate[] = [
  {
    id: 'basic-budget',
    name: 'Basic Budget',
    isDefault: true,
    sections: [
      { id: 'needs', name: 'Needs' },
      { id: 'wants', name: 'Wants' },
      { id: 'savings', name: 'Savings' },
    ],
    categories: [
      { id: 'housing', name: 'Housing', budgeted: 0, spent: 0, sectionId: 'needs' },
      { id: 'utilities', name: 'Utilities', budgeted: 0, spent: 0, sectionId: 'needs' },
      { id: 'groceries', name: 'Groceries', budgeted: 0, spent: 0, sectionId: 'needs' },
      { id: 'entertainment', name: 'Entertainment', budgeted: 0, spent: 0, sectionId: 'wants' },
      { id: 'shopping', name: 'Shopping', budgeted: 0, spent: 0, sectionId: 'wants' },
      { id: 'emergency', name: 'Emergency Fund', budgeted: 0, spent: 0, sectionId: 'savings' },
      { id: 'retirement', name: 'Retirement', budgeted: 0, spent: 0, sectionId: 'savings' },
    ],
  },
  {
    id: '50-30-20',
    name: '50/30/20 Budget',
    isDefault: true,
    sections: [
      { id: 'essentials', name: 'Essentials (50%)' },
      { id: 'wants', name: 'Wants (30%)' },
      { id: 'savings', name: 'Savings (20%)' },
    ],
    categories: [
      { id: 'housing', name: 'Housing', budgeted: 0, spent: 0, sectionId: 'essentials' },
      { id: 'utilities', name: 'Utilities', budgeted: 0, spent: 0, sectionId: 'essentials' },
      { id: 'food', name: 'Food', budgeted: 0, spent: 0, sectionId: 'essentials' },
      { id: 'entertainment', name: 'Entertainment', budgeted: 0, spent: 0, sectionId: 'wants' },
      { id: 'shopping', name: 'Shopping', budgeted: 0, spent: 0, sectionId: 'wants' },
      { id: 'dining', name: 'Dining Out', budgeted: 0, spent: 0, sectionId: 'wants' },
      { id: 'emergency', name: 'Emergency Fund', budgeted: 0, spent: 0, sectionId: 'savings' },
      { id: 'retirement', name: 'Retirement', budgeted: 0, spent: 0, sectionId: 'savings' },
    ],
  },
];

const initialState: BudgetTemplateState = {
  templates: defaultTemplates,
};

const budgetTemplateSlice = createSlice({
  name: 'budgetTemplates',
  initialState,
  reducers: {
    saveTemplate: (state, action: PayloadAction<{
      name: string;
      sections: BudgetSection[];
      categories: BudgetCategory[];
    }>) => {
      const newTemplate: BudgetTemplate = {
        id: uuidv4(),
        ...action.payload,
      };
      state.templates.push(newTemplate);
    },
    
    deleteTemplate: (state, action: PayloadAction<{ id: string }>) => {
      state.templates = state.templates.filter(
        template => template.id !== action.payload.id || template.isDefault
      );
    },
  },
});

export const { saveTemplate, deleteTemplate } = budgetTemplateSlice.actions;
export default budgetTemplateSlice.reducer;