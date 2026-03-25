import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { 
  createComplaint, 
  getComplaints, 
  updateComplaintStatus,
  assignComplaint,
  getComplaintById,
  getComplaintActivity,
  submitComplaintFeedback,
  previewComplaintClassification
} from '../controllers/complaint.controller';

const router = express.Router();

/**
 * Target Output: /api/complaints/*
 */
router.use(requireAuth);

router.post('/preview', requireRole(['resident']), previewComplaintClassification);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.get('/:id/activity', getComplaintActivity);

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage(), limits: { files: 3, fileSize: 5 * 1024 * 1024 } });

router.post(
  '/', 
  requireRole(['resident']), 
  upload.array('images', 3),
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

// Feedback Loop exclusively for Residents on Resolved Tickets
router.post(
  '/:id/feedback',
  requireRole(['resident']),
  submitComplaintFeedback
);

export default router;
# commit-marker: [2026-03-15 11:30:00] Create complaint routes with auth middleware guard
# commit-marker: [2026-03-25 09:30:00] Add complaint assignment to staff member
