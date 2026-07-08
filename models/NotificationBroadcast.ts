import mongoose, { Document, Schema, models } from "mongoose";
import { MAX_STORED_ERRORS } from "@/lib/admin/notification-broadcast-utils";

export interface INotificationBroadcast extends Document {
  title: string;
  body: string;
  url: string;
  sentBy: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  deliveryErrors: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotificationBroadcastSchema = new Schema<INotificationBroadcast>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    url: { type: String, default: "/budget", trim: true },
    sentBy: { type: String, required: true, trim: true },
    recipientCount: { type: Number, required: true, min: 0 },
    sentCount: { type: Number, required: true, min: 0 },
    failedCount: { type: Number, required: true, min: 0 },
    deliveryErrors: {
      type: [String],
      default: [],
      validate: {
        validator: (value: string[]) => value.length <= MAX_STORED_ERRORS,
        message: `deliveryErrors cannot exceed ${MAX_STORED_ERRORS} entries`,
      },
    },
  },
  { timestamps: true }
);

export default models.NotificationBroadcast ||
  mongoose.model<INotificationBroadcast>(
    "NotificationBroadcast",
    NotificationBroadcastSchema
  );
