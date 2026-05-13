import { z } from 'zod';

export const createMessageSchema = z.object({
  leadId: z.string().min(1),
  campaignId: z.string().optional(),
  type: z.enum(['cold_email', 'linkedin_dm', 'follow_up', 'investor', 'partnership']),
  subject: z.string().max(500).trim().optional(),
  body: z.string().min(1).max(10000),
  tone: z.string().max(50).trim().optional(),
  channel: z.enum(['email', 'linkedin', 'manual']).optional(),
  aiGenerated: z.boolean().optional(),
});

export const updateMessageSchema = z.object({
  subject: z.string().max(500).trim().optional(),
  body: z.string().min(1).max(10000).optional(),
  status: z.enum(['draft', 'sent', 'replied', 'bounced']).optional(),
});

export const messageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  leadId: z.string().optional(),
  campaignId: z.string().optional(),
  status: z.enum(['draft', 'sent', 'replied', 'bounced']).optional(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type MessageQueryInput = z.infer<typeof messageQuerySchema>;
