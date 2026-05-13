import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILead {
  userId: Types.ObjectId;
  name: string;
  email?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  tags: string[];
  stage: 'cold' | 'warm' | 'hot' | 'engaged' | 'closed';
  engagementScore: number;
  notes?: string;
  lastContactedAt?: Date;
  nextActionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadDocument = ILead & Document;

const leadSchema = new Schema<LeadDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    company: { type: String, trim: true },
    title: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    stage: {
      type: String,
      enum: ['cold', 'warm', 'hot', 'engaged', 'closed'],
      default: 'cold',
    },
    engagementScore: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String },
    lastContactedAt: { type: Date },
    nextActionAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ userId: 1, stage: 1 });
leadSchema.index({ userId: 1, tags: 1 });
leadSchema.index({ userId: 1, engagementScore: -1 });

const Lead = mongoose.model<LeadDocument>('Lead', leadSchema);
export default Lead;
