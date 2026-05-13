import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import { createCampaignSchema, updateCampaignSchema, campaignQuerySchema } from '../lib/validators/campaign.validators';
import * as campaignService from '../services/campaign.service';

export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const data = createCampaignSchema.parse(req.body);
  const campaign = await campaignService.createCampaign(req.user!.id, data);
  res.status(201).json({ success: true, data: campaign });
});

export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const query = campaignQuerySchema.parse(req.query);
  const result = await campaignService.getCampaigns(req.user!.id, query);
  res.json({ success: true, data: result.campaigns, meta: result.meta });
});

export const getCampaignById = asyncHandler(async (req: Request, res: Response) => {
  const campaign = await campaignService.getCampaignById(req.user!.id, req.params.id as string);
  res.json({ success: true, data: campaign });
});

export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  const data = updateCampaignSchema.parse(req.body);
  const campaign = await campaignService.updateCampaign(req.user!.id, req.params.id as string, data);
  res.json({ success: true, data: campaign });
});

export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  await campaignService.deleteCampaign(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { deleted: true } });
});
export const trackSent = asyncHandler(async (req: Request, res: Response) => {
  const { leadId } = req.body;
  const campaign = await campaignService.trackSent(req.user!.id, req.params.id as string, leadId);
  res.json({ success: true, data: campaign });
});

export const trackReply = asyncHandler(async (req: Request, res: Response) => {
  const { leadId } = req.body;
  const campaign = await campaignService.trackReply(req.user!.id, req.params.id as string, leadId);
  res.json({ success: true, data: campaign });
});
export const trackReplyByLead = asyncHandler(async (req: Request, res: Response) => {
  const result = await campaignService.trackReplyByLead(req.user!.id, req.params.leadId as string);
  res.json({ success: true, data: result });
});
