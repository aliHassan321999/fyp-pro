import express from 'express';
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  getDepartmentStaff,
  assignHead,
  updateDepartment,
  recommendStaff
} from '../controllers/department.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);

// Collection routes
router.post('/', requireRole(['admin']), createDepartment);
router.get('/', requireRole(['admin']), getDepartments);

// Single department routes
router.get('/:id/recommend-staff', requireRole(['admin', 'department_head']), recommendStaff);
router.get('/:id', requireRole(['admin', 'department_head']), getDepartmentById);
router.patch('/:id', requireRole(['admin']), updateDepartment);
router.get('/:id/staff', requireRole(['admin', 'department_head']), getDepartmentStaff);
router.patch('/:id/assign-head', requireRole(['admin']), assignHead);

export default router;
