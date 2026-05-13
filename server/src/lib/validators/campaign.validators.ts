import { z } from 'zod';

const statusEnum = z.enum(['draft', 'active', 'paused', 'completed']);
const typeEnum = z.enum(['cold_outreach', 'follow_up', 'investor', 'partnership']);

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  type: typeEnum.optional(),
  leadIds: z.array(z.string()).optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  status: statusEnum.optional(),
  type: typeEnum.optional(),
  leadIds: z.array(z.string()).optional(),
});

export const campaignQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: statusEnum.optional(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
