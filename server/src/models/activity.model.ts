import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity {
  userId: Types.ObjectId;
  leadId?: Types.ObjectId;
  campaignId?: Types.ObjectId;
  type: 'lead_added' | 'message_sent' | 'reply_received' | 'campaign_launched' | 'memory_updated' | 'outreach_sent' | 'lead_replied';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export type ActivityDocument = IActivity & Document;

const activitySchema = new Schema<ActivityDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    type: {
      type: String,
      enum: ['lead_added', 'message_sent', 'reply_received', 'campaign_launched', 'memory_updated', 'outreach_sent', 'lead_replied'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Activity = mongoose.model<ActivityDocument>('Activity', activitySchema);
export default Activity;
