import express from 'express';
import { getStaffDashboard } from '../controllers/staff.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(['staff']));

router.get('/dashboard', getStaffDashboard);

export default router;
