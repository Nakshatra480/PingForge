import { Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import * as emailService from '../services/email.service';
import * as campaignService from '../services/campaign.service';
import AppError from '../lib/app-error';

export const sendDirectEmail = asyncHandler(async (req: Request, res: Response) => {
  const { to, subject, content, campaignId, leadId } = req.body;

  if (!to || !subject || !content) {
    throw new AppError('To, subject, and content are required', 400, 'MISSING_FIELDS');
  }

  // Send the email — this is the critical path
  const info = await emailService.sendEmail(req.user!.id, to, subject, content);

  // Track asynchronously — never block or fail the email send if tracking errors
  if (campaignId) {
    campaignService.trackSent(req.user!.id, campaignId, leadId).catch((err) => {
      console.error('[outreach] tracking failed (non-fatal):', err.message);
    });
  }

  res.json({ success: true, data: { messageId: info.messageId, sent: true } });
});
