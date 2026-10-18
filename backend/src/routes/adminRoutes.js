import { Router } from 'express';
import {
  getAdminMetrics,
  getAllUsers,
  createUserByAdmin,
  updateUserStatus,
  deleteUser,
  getAllLinksAdmin,
  toggleSuspiciousLink,
  getBlockedDomains,
  addBlockedDomain,
  removeBlockedDomain,
  getSystemLogs
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

router.get('/metrics', getAdminMetrics);
router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/links', getAllLinksAdmin);
router.patch('/links/:id/toggle-suspicious', toggleSuspiciousLink);

router.get('/blocked-domains', getBlockedDomains);
router.post('/blocked-domains', addBlockedDomain);
router.delete('/blocked-domains/:domain', removeBlockedDomain);

router.get('/logs', getSystemLogs);

export default router;
