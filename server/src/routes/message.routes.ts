import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import authenticate from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', messageController.getMessages);
router.post('/', messageController.createMessage);
router.get('/:id', messageController.getMessageById);
router.put('/:id', messageController.updateMessage);

export default router;
