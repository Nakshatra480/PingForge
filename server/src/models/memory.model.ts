import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMemory {
  userId: Types.ObjectId;
  leadId: Types.ObjectId;
  summary: string;
  tone?: string;
  keyPoints: string[];
  nextSuggestedAction?: string;
  rawInteractions: Array<{ role: string; content: string; at: Date }>;
  lastUpdatedAt: Date;
  createdAt: Date;
}

export type MemoryDocument = IMemory & Document;

const memorySchema = new Schema<MemoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    summary: { type: String, default: '' },
    tone: { type: String, trim: true },
    keyPoints: [{ type: String }],
    nextSuggestedAction: { type: String },
    rawInteractions: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

memorySchema.index({ userId: 1, leadId: 1 }, { unique: true });

const Memory = mongoose.model<MemoryDocument>('Memory', memorySchema);
export default Memory;
