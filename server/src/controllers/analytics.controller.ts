import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import * as analyticsService from '../services/analytics.service';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats(req.user!.id);
  res.json({ success: true, data: stats });
});

export const getCampaignAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await analyticsService.getCampaignAnalytics(req.user!.id);
  res.json({ success: true, data: analytics });
});
