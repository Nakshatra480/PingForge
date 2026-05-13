import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/dashboard', analyticsController.getDashboard);
router.get('/campaigns', analyticsController.getCampaignAnalytics);

export default router;
