import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/smtp-status', settingsController.getSmtpStatus);
router.put('/profile', settingsController.updateProfile);
router.put('/password', settingsController.updatePassword);

export default router;
