import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICampaign {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'cold_outreach' | 'follow_up' | 'investor' | 'partnership';
  targetCount: number;
  sentCount: number;
  replyCount: number;
  leadIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignDocument = ICampaign & Document;

const campaignSchema = new Schema<CampaignDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'draft',
    },
    type: {
      type: String,
      enum: ['cold_outreach', 'follow_up', 'investor', 'partnership'],
      default: 'cold_outreach',
    },
    targetCount: { type: Number, default: 0 },
    sentCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
    leadIds: [{ type: Schema.Types.ObjectId, ref: 'Lead' }],
  },
  { timestamps: true }
);

campaignSchema.index({ userId: 1, status: 1 });

const Campaign = mongoose.model<CampaignDocument>('Campaign', campaignSchema);
export default Campaign;
