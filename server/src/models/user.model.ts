import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  title?: string;
  company?: string;
  phone?: string;
  password: string;
  refreshTokenVersion: number;
  preferences: {
    defaultTone: 'professional' | 'friendly' | 'direct' | 'startup';
    defaultMessageType: 'cold_email' | 'linkedin_dm' | 'follow_up' | 'investor';
    smtp?: {
      host: string;
      port: number;
      user: string;
      pass: string;
      fromName: string;
      fromEmail: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = IUser & Document;

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, required: true, select: false },
    refreshTokenVersion: { type: Number, default: 0, select: false },
    preferences: {
      defaultTone: {
        type: String,
        enum: ['professional', 'friendly', 'direct', 'startup'],
        default: 'professional',
      },
      defaultMessageType: {
        type: String,
        enum: ['cold_email', 'linkedin_dm', 'follow_up', 'investor'],
        default: 'cold_email',
      },
      smtp: {
        host: { type: String },
        port: { type: Number },
        user: { type: String },
        pass: { type: String },
        fromName: { type: String },
        fromEmail: { type: String },
      },
    },
  },
  { timestamps: true }
);



const User = mongoose.model<UserDocument>('User', userSchema);
export default User;
