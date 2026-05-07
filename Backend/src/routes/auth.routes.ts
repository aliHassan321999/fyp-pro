import express from 'express';
import { register, login, logout, getMe, refresh, updateMyProfile } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import multer from 'multer';

const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

/**
 * Target Output: /api/auth/*
 */

// Core public generation endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected session lifecycle manipulations
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, upload.single('avatar'), updateMyProfile);

export default router;
# commit-marker: [2026-03-08 15:30:00] Setup auth routes with validation middleware
# commit-marker: [2026-04-03 09:45:00] Create audit log routes for SuperAdmin access
# commit-marker: [2026-05-07 13:00:00] Add integration tests for auth and complaint APIs
