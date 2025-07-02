import mongoose from "mongoose";

const monthlyBudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  categories: [
    {
      name: String,
      budgeted: Number,
      spent: Number,
    },
  ],
  totalBudgeted: {
    type: Number,
    required: true,
  },
  totalSpent: {
    type: Number,
    required: true,
  },
  expensesCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.MonthlyBudget ||
  mongoose.model("MonthlyBudget", monthlyBudgetSchema);
