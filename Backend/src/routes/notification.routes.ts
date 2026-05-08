import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;
