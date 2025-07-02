import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  budgeted: number;
  spent: number;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    budgeted: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    sectionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
