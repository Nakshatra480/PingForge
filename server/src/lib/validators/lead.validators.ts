import { z } from 'zod';

const stageEnum = z.enum(['cold', 'warm', 'hot', 'engaged', 'closed']);

export const createLeadSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  email: z.string().email().optional().or(z.literal('')),
  company: z.string().max(200).trim().optional(),
  title: z.string().max(200).trim().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string().trim()).max(20).optional(),
  stage: stageEnum.optional(),
  engagementScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  stage: stageEnum.optional(),
  tags: z.string().optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['createdAt', 'engagementScore', 'name', 'lastContactedAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
