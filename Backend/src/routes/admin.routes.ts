import express from 'express';
import { getPendingUsers, approveUser, rejectUser, getGlobalAnalytics } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Intercept all routes heavily enforcing strictly 'admin' execution matrices
router.use(requireAuth, requireRole(['admin']));

router.get('/analytics', getGlobalAnalytics);
router.get('/pending-users', getPendingUsers);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);

export default router;
