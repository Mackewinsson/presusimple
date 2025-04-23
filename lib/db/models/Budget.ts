import { Schema, model, models, Document } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  name: string;
  date: string;
  sections: Array<{
    id: string;
    name: string;
  }>;
  categories: Array<{
    id: string;
    name: string;
    budgeted: number;
    spent: number;
    sectionId: string;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    description: string;
    categoryId: string;
    date: string;
    type: 'expense' | 'income';
  }>;
  totalBudgeted: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
  },
  date: {
    type: String,
    required: [true, 'Budget date is required'],
  },
  sections: [{
    id: String,
    name: String,
  }],
  categories: [{
    id: String,
    name: String,
    budgeted: Number,
    spent: Number,
    sectionId: String,
  }],
  expenses: [{
    id: String,
    amount: Number,
    description: String,
    categoryId: String,
    date: String,
    type: {
      type: String,
      enum: ['expense', 'income'],
    },
  }],
  totalBudgeted: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
budgetSchema.index({ userId: 1, date: 1 });
budgetSchema.index({ 'categories.id': 1 });
budgetSchema.index({ 'sections.id': 1 });

export const Budget = models.Budget || model<IBudget>('Budget', budgetSchema);