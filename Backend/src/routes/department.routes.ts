import express from 'express';
import { createDepartment, getDepartments } from '../controllers/department.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole(['admin']), createDepartment);
router.get('/', requireRole(['admin']), getDepartments);

export default router;
