import api from './client';
import type { ApiResponse, Lead, Campaign, Message, DashboardStats, User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data) as Promise<ApiResponse<{ user: User; accessToken: string }>>,
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data) as Promise<ApiResponse<{ user: User; accessToken: string }>>,
  refresh: () =>
    api.post('/auth/refresh') as Promise<ApiResponse<{ accessToken: string }>>,
  logout: () =>
    api.post('/auth/logout') as Promise<ApiResponse<{ message: string }>>,
  me: () =>
    api.get('/auth/me') as Promise<ApiResponse<User>>,
};

export const leadApi = {
  list: (params?: Record<string, any>) =>
    api.get('/leads', { params }) as Promise<ApiResponse<Lead[]>>,
  get: (id: string) =>
    api.get(`/leads/${id}`) as Promise<ApiResponse<Lead>>,
  create: (data: Partial<Lead>) =>
    api.post('/leads', data) as Promise<ApiResponse<Lead>>,
  update: (id: string, data: Partial<Lead>) =>
    api.put(`/leads/${id}`, data) as Promise<ApiResponse<Lead>>,
  delete: (id: string) =>
    api.delete(`/leads/${id}`) as Promise<ApiResponse<{ deleted: boolean }>>,
};

export const campaignApi = {
  list: (params?: Record<string, any>) =>
    api.get('/campaigns', { params }) as Promise<ApiResponse<Campaign[]>>,
  get: (id: string) =>
    api.get(`/campaigns/${id}`) as Promise<ApiResponse<Campaign>>,
  create: (data: Partial<Campaign>) =>
    api.post('/campaigns', data) as Promise<ApiResponse<Campaign>>,
  update: (id: string, data: Partial<Campaign>) =>
    api.put(`/campaigns/${id}`, data) as Promise<ApiResponse<Campaign>>,
  delete: (id: string) =>
    api.delete(`/campaigns/${id}`) as Promise<ApiResponse<{ deleted: boolean }>>,
  trackSent: (id: string, leadId?: string) =>
    api.post(`/campaigns/${id}/track/sent`, { leadId }) as Promise<ApiResponse<Campaign>>,
  trackReply: (id: string, leadId?: string) =>
    api.post(`/campaigns/${id}/track/reply`, { leadId }) as Promise<ApiResponse<Campaign>>,
  trackReplyByLead: (leadId: string) =>
    api.post(`/campaigns/track-reply-by-lead/${leadId}`) as Promise<ApiResponse<{ success: boolean; updatedCampaigns: number }>>,
};

export const messageApi = {
  list: (params?: Record<string, any>) =>
    api.get('/messages', { params }) as Promise<ApiResponse<Message[]>>,
  get: (id: string) =>
    api.get(`/messages/${id}`) as Promise<ApiResponse<Message>>,
  create: (data: Partial<Message>) =>
    api.post('/messages', data) as Promise<ApiResponse<Message>>,
  update: (id: string, data: Partial<Message>) =>
    api.put(`/messages/${id}`, data) as Promise<ApiResponse<Message>>,
};

export const aiApi = {
  generate: (data: {
    type: string;
    tone: string;
    leadId?: string;
    leadContext?: { name?: string; company?: string; title?: string; notes?: string };
    additionalContext?: string;
    previousMessage?: string;
  }) => api.post('/ai/generate', data) as Promise<ApiResponse<{ content: string; type: string; tone: string }>>,
  operator: (data: {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) => api.post('/ai/operator', data) as Promise<ApiResponse<{ response: string }>>,
};

export const analyticsApi = {
  dashboard: () =>
    api.get('/analytics/dashboard') as Promise<ApiResponse<DashboardStats>>,
  campaigns: () =>
    api.get('/analytics/campaigns') as Promise<ApiResponse<any[]>>,
};

export const settingsApi = {
  updateProfile: (data: { name?: string; email?: string; preferences?: any }) =>
    api.put('/settings/profile', data) as Promise<ApiResponse<User>>,
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/settings/password', data) as Promise<ApiResponse<{ message: string }>>,
};

export const outreachApi = {
  sendEmail: (data: { to: string; subject: string; content: string; campaignId?: string; leadId?: string }) =>
    api.post('/outreach/send-email', data) as Promise<ApiResponse<{ messageId: string }>>,
};
