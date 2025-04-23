import { Schema, model, models, Document } from 'mongoose';

export interface IBudgetTemplate extends Document {
  userId: string;
  name: string;
  isDefault: boolean;
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
  createdAt: Date;
  updatedAt: Date;
}

const budgetTemplateSchema = new Schema<IBudgetTemplate>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Template name is required'],
  },
  isDefault: {
    type: Boolean,
    default: false,
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
}, {
  timestamps: true,
});

// Create indexes for better query performance
budgetTemplateSchema.index({ userId: 1, name: 1 });

export const BudgetTemplate = models.BudgetTemplate || model<IBudgetTemplate>('BudgetTemplate', budgetTemplateSchema);