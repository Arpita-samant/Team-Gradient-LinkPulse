import { Router } from 'express';
import { getUserDashboardAnalytics } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/dashboard', requireAuth, getUserDashboardAnalytics);

export default router;
