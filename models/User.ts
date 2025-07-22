import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isPaid?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  subscriptionType?: string; // "stripe", "manual_paid", "manual_trial", etc.
  plan?: "free" | "pro";
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  isPaid: { type: Boolean, default: false },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  subscriptionType: { type: String }, // Track subscription source
  plan: {
    type: String,
    enum: ["free", "pro"],
    default: "free"
  }
});

export default models.User || mongoose.model<IUser>("User", UserSchema);
