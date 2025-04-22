import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  }
}, {
  timestamps: true,
});

// Check if the model exists before creating a new one
export const User = models.User || model<IUser>('User', userSchema);