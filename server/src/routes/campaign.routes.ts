import { Router } from 'express';
import * as campaignController from '../controllers/campaign.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', campaignController.getCampaigns);
router.post('/', campaignController.createCampaign);
router.get('/:id', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);
router.post('/:id/track/sent', campaignController.trackSent);
router.post('/:id/track/reply', campaignController.trackReply);
router.post('/track-reply-by-lead/:leadId', campaignController.trackReplyByLead);

export default router;
