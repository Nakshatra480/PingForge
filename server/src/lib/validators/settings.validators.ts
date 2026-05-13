import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  title: z.string().max(100).trim().optional(),
  company: z.string().max(100).trim().optional(),
  phone: z.string().max(30).trim().optional(),
  preferences: z.object({
    defaultTone: z.enum(['professional', 'friendly', 'direct', 'startup']).optional(),
    defaultMessageType: z.enum(['cold_email', 'linkedin_dm', 'follow_up', 'investor']).optional(),
    smtp: z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      user: z.string().optional(),
      pass: z.string().optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
