import { Router } from 'express';
import authRoutes from './auth.routes';
import leadRoutes from './lead.routes';
import campaignRoutes from './campaign.routes';
import messageRoutes from './message.routes';
import analyticsRoutes from './analytics.routes';
import settingsRoutes from './settings.routes';
import activityRoutes from './activity.routes';
import aiRoutes from './ai.routes';
import outreachRoutes from './outreach.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/messages', messageRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);
router.use('/activities', activityRoutes);
router.use('/ai', aiRoutes);
router.use('/outreach', outreachRoutes);

export default router;
