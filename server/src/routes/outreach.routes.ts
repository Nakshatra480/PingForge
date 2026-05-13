import { Router } from 'express';
import * as outreachController from '../controllers/outreach.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.post('/send-email', outreachController.sendDirectEmail);

export default router;
