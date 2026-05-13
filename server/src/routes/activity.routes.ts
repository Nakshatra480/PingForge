import { Router, Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import authenticate from '../middleware/auth';
import Activity from '../models/activity.model';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments({ userId: req.user!.id }),
  ]);

  res.json({
    success: true,
    data: activities,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}));

export default router;
