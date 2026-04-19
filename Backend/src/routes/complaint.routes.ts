import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus,
  assignComplaint,
  getComplaintById,
  getComplaintActivity
} from '../controllers/complaint.controller';

const router = express.Router();

/**
 * Target Output: /api/complaints/*
 */
router.use(requireAuth);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.get('/:id/activity', getComplaintActivity);

router.post(
  '/', 
  requireRole(['resident']), 
  createComplaint
);

// Admins, Department Heads, and Staff implicitly modify metrics
// Note: Intentionally decoupled requireComplaintOwnership allowing dynamic workflow updates.
router.patch(
  '/:id/status', 
  requireRole(['department_head', 'staff', 'admin']),
  updateComplaintStatus
);

// Decoupled Assignment Method exclusively structurally locked to Managers
router.patch(
  '/:id/assign',
  requireRole(['department_head']),
  assignComplaint
);

export default router;
