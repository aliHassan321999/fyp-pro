import express from 'express';
import { getPendingUsers, approveUser, rejectUser, getGlobalAnalytics, getAuditLogs, testActivityLogs } from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Intercept all routes heavily enforcing strictly 'admin' or 'superadmin' execution matrices
router.use(requireAuth, requireRole(['admin', 'superadmin']));

router.get('/analytics', getGlobalAnalytics);
router.get('/pending-users', getPendingUsers);
router.get('/test-activity-logs', testActivityLogs);
router.get('/audit-logs', getAuditLogs);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);

export default router;
