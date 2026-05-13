import { z } from 'zod';

export const generateSchema = z.object({
  type: z.enum(['cold_email', 'linkedin_dm', 'follow_up', 'investor', 'partnership']),
  tone: z.enum(['professional', 'friendly', 'direct', 'startup', 'concise']).default('professional'),
  leadId: z.string().optional(),
  leadContext: z.object({
    name: z.string().optional(),
    company: z.string().optional(),
    title: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  additionalContext: z.string().max(2000).optional(),
  previousMessage: z.string().max(5000).optional(),
});

export const operatorSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20).optional(),
});

export type GenerateInput = z.infer<typeof generateSchema>;
export type OperatorInput = z.infer<typeof operatorSchema>;
