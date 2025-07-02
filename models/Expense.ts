import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface IExpense extends Document {
  user: Types.ObjectId;
  budget: Types.ObjectId;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  type: "expense" | "income";
}

const ExpenseSchema = new Schema<IExpense>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    budget: { type: Schema.Types.ObjectId, ref: "Budget", required: true },
    categoryId: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ["expense", "income"], required: true },
  },
  {
    timestamps: true,
  }
);

export default models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);
