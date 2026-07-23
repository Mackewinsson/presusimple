import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICategoryCollaborator {
  user?: Types.ObjectId;
  email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
}

export interface ICategory extends Document {
  name: string;
  budgeted: number;
  spent: number;
  budgetId: string;
  order: number;
  collaborators?: ICategoryCollaborator[];
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
    budgetId: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    collaborators: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        email: { type: String, required: true },
        role: { type: String, enum: ["editor", "viewer"], default: "editor" },
        status: { type: String, enum: ["pending", "accepted"], default: "pending" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Category ||
  mongoose.model<ICategory>("Category", CategorySchema);
