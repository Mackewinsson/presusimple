import mongoose, { Schema, Document, Types, models } from "mongoose";

export interface ISection {
  name: string;
}

export interface IBudget extends Document {
  user: Types.ObjectId;
  month: number;
  year: number;
  sections: ISection[];
  totalBudgeted: number;
  totalAvailable: number;
}

const SectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
});

const BudgetSchema = new Schema<IBudget>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  sections: [SectionSchema],
  totalBudgeted: { type: Number, required: true },
  totalAvailable: { type: Number, required: true },
});

export default models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
