import mongoose, { Document, Schema } from 'mongoose';

export interface IFeature extends Document {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  platforms: ('web' | 'mobile')[];
  userTypes: ('free' | 'pro' | 'admin')[];
  rolloutPercentage: number; // 0-100, for gradual rollouts
  targetUsers?: string[]; // Specific user IDs for targeted rollouts
  excludeUsers?: string[]; // User IDs to exclude from rollout
  metadata?: Record<string, any>; // Additional configuration data
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID who created the feature
  lastModifiedBy: string; // Admin user ID who last modified the feature
}

const FeatureSchema = new Schema<IFeature>({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9_-]+$/, // Only allow lowercase letters, numbers, underscores, and hyphens
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  platforms: [{
    type: String,
    enum: ['web', 'mobile'],
    required: true,
  }],
  userTypes: [{
    type: String,
    enum: ['free', 'pro', 'admin'],
    required: true,
  }],
  rolloutPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100,
  },
  targetUsers: [{
    type: String,
  }],
  excludeUsers: [{
    type: String,
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdBy: {
    type: String,
    required: true,
  },
  lastModifiedBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries (separate indexes to avoid parallel array indexing issues)
FeatureSchema.index({ enabled: 1 });
FeatureSchema.index({ platforms: 1 });
FeatureSchema.index({ userTypes: 1 });
// Note: key field already has unique index from schema definition

// Ensure key is unique and follows naming convention
FeatureSchema.pre('save', function(next) {
  if (this.isModified('key')) {
    this.key = this.key.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  }
  next();
});

export default mongoose.models.Feature || mongoose.model<IFeature>('Feature', FeatureSchema);
