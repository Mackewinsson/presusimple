import { Schema, model, models, Document } from 'mongoose';

export interface ISavingsGoal extends Document {
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const savingsGoalSchema = new Schema<ISavingsGoal>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: 0,
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  deadline: String,
  categoryId: String,
}, {
  timestamps: true,
});

// Create indexes for better query performance
savingsGoalSchema.index({ userId: 1, categoryId: 1 });

export const SavingsGoal = models.SavingsGoal || model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);