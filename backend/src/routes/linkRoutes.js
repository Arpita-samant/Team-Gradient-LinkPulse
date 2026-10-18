import { Router } from 'express';
import {
  createLink,
  getUserLinks,
  getLinkById,
  updateLink,
  toggleLinkStatus,
  deleteLink,
  exportLinks
} from '../controllers/linkController.js';
import { verifyLinkPassword } from '../controllers/redirectController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';
import { createLinkLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Create short link (supports authenticated users or guests)
router.post('/create', createLinkLimiter, optionalAuth, createLink);

// User links management
router.get('/my-links', requireAuth, getUserLinks);
router.get('/export', requireAuth, exportLinks);
router.get('/:id', requireAuth, getLinkById);
router.put('/:id', requireAuth, updateLink);
router.patch('/:id/toggle-status', requireAuth, toggleLinkStatus);
router.delete('/:id', requireAuth, deleteLink);

// Password challenge verification endpoint
router.post('/verify-password', verifyLinkPassword);

export default router;
