import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import { createLeadSchema, updateLeadSchema, leadQuerySchema } from '../lib/validators/lead.validators';
import * as leadService from '../services/lead.service';

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const data = createLeadSchema.parse(req.body);
  const lead = await leadService.createLead(req.user!.id, data);
  res.status(201).json({ success: true, data: lead });
});

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const query = leadQuerySchema.parse(req.query);
  const result = await leadService.getLeads(req.user!.id, query);
  res.json({ success: true, data: result.leads, meta: result.meta });
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(req.user!.id, req.params.id as string);
  res.json({ success: true, data: lead });
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const data = updateLeadSchema.parse(req.body);
  const lead = await leadService.updateLead(req.user!.id, req.params.id as string, data);
  res.json({ success: true, data: lead });
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await leadService.deleteLead(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { deleted: true } });
});
