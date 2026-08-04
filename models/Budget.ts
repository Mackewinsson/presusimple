import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface IBudgetCollaborator {
  user?: Types.ObjectId;
  email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
}

export interface IBudget extends Document {
  user: Types.ObjectId;
  month: number;
  year: number;
  totalBudgeted: number;
  totalAvailable: number;
  collaborators?: IBudgetCollaborator[];
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  totalBudgeted: { type: Number, required: true },
  totalAvailable: { type: Number, required: true },
  collaborators: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      email: { type: String, required: true },
      role: { type: String, enum: ["editor", "viewer"], default: "editor" },
      status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    },
  ],
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

export default models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
