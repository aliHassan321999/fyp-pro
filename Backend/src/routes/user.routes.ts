import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { getStaffMembers, createStaff, assignStaffDepartment } from '../controllers/user.controller';

const router = express.Router();

router.use(requireAuth);

router.get('/staff', requireRole(['department_head', 'admin']), getStaffMembers);
router.post('/', requireRole(['admin']), createStaff);
router.patch('/:id/assign-department', requireRole(['admin']), assignStaffDepartment);

export default router;
