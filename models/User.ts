import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string; // For mobile app authentication
  name?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  isPaid?: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  subscriptionType?: string; // "stripe", "manual_paid", "manual_trial", etc.
  plan?: "free" | "pro";
  currency?: string; // Currency code (e.g., "USD", "EUR")
  decimalSeparator?: "dot" | "comma"; // Number format: dot (1,234.56) or comma (1.234,56)
  // Notification fields
  pushSubscription?: any; // Push subscription object
  notificationEnabled?: boolean;
  lastNotificationUpdate?: Date;
  // Streak (Duolingo-style)
  streakCount?: number;
  lastActivityDate?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // For mobile app authentication
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
  },
  currency: { type: String, default: "USD" },
  decimalSeparator: { type: String, enum: ["dot", "comma"], default: "dot" },
  // Notification fields
  pushSubscription: { type: Schema.Types.Mixed }, // Push subscription object
  notificationEnabled: { type: Boolean, default: false },
  lastNotificationUpdate: { type: Date },
  // Streak
  streakCount: { type: Number, default: 0 },
  lastActivityDate: { type: Date }
});

export default models.User || mongoose.model<IUser>("User", UserSchema);
