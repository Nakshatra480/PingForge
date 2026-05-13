import { Router } from 'express';
import * as leadController from '../controllers/lead.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

export default router;
