import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage {
  userId: Types.ObjectId;
  leadId: Types.ObjectId;
  campaignId?: Types.ObjectId;
  type: 'cold_email' | 'linkedin_dm' | 'follow_up' | 'investor' | 'partnership';
  subject?: string;
  body: string;
  tone?: string;
  channel: 'email' | 'linkedin' | 'manual';
  status: 'draft' | 'sent' | 'replied' | 'bounced';
  aiGenerated: boolean;
  sentAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
}

export type MessageDocument = IMessage & Document;

const messageSchema = new Schema<MessageDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', index: true },
    type: {
      type: String,
      enum: ['cold_email', 'linkedin_dm', 'follow_up', 'investor', 'partnership'],
      required: true,
    },
    subject: { type: String, trim: true },
    body: { type: String, required: true },
    tone: { type: String, trim: true },
    channel: {
      type: String,
      enum: ['email', 'linkedin', 'manual'],
      default: 'email',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'replied', 'bounced'],
      default: 'draft',
    },
    aiGenerated: { type: Boolean, default: true },
    sentAt: { type: Date },
    repliedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ userId: 1, status: 1 });
messageSchema.index({ leadId: 1, createdAt: -1 });

const Message = mongoose.model<MessageDocument>('Message', messageSchema);
export default Message;
