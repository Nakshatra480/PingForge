import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import authenticate from '../middleware/auth';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
