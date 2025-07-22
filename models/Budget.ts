import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface ISection {
  name: string;
  displayName?: string;
  uniqueId?: string;
}

export interface IBudget extends Document {
  user: Types.ObjectId;
  month: number;
  year: number;
  sections: ISection[];
  totalBudgeted: number;
  totalAvailable: number;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  displayName: { type: String },
  uniqueId: { type: String },
});

const BudgetSchema = new Schema<IBudget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  sections: [SectionSchema],
  totalBudgeted: { type: Number, required: true },
  totalAvailable: { type: Number, required: true },
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

export default models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
