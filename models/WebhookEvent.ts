import mongoose, { Schema, Document, models } from "mongoose";

export interface IWebhookEvent extends Document {
  eventId: string;
  processedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    processedAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

export default models.WebhookEvent ||
  mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);
