export interface User {
  id: string;
  name: string;
  email: string;
  title?: string;
  company?: string;
  phone?: string;
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
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email?: string;
  company?: string;
  title?: string;
  linkedinUrl?: string;
  tags: string[];
  stage: 'cold' | 'warm' | 'hot' | 'engaged' | 'closed';
  engagementScore: number;
  notes?: string;
  lastContactedAt?: string;
  nextActionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  _id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  type: 'cold_outreach' | 'follow_up' | 'investor' | 'partnership';
  targetCount: number;
  sentCount: number;
  replyCount: number;
  leadIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  leadId: string;
  campaignId?: string;
  type: 'cold_email' | 'linkedin_dm' | 'follow_up' | 'investor' | 'partnership';
  subject?: string;
  body: string;
  tone?: string;
  channel: 'email' | 'linkedin' | 'manual';
  status: 'draft' | 'sent' | 'replied' | 'bounced';
  aiGenerated: boolean;
  sentAt?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface Activity {
  _id: string;
  type: 'lead_added' | 'message_sent' | 'reply_received' | 'campaign_launched' | 'memory_updated' | 'outreach_sent' | 'lead_replied';
  description: string;
  createdAt: string;
}

export interface DashboardStats {
  leads: number;
  campaigns: number;
  messagesSent: number;
  replyRate: number;
  recentActivity: Activity[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
  code?: string;
}
