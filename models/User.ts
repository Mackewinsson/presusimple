import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
  email: string;
  name?: string;
  // Add other fields as needed
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  // Add other fields as needed
});

export default models.User || mongoose.model<IUser>("User", UserSchema);
