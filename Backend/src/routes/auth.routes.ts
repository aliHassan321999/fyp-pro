import express from 'express';
import { register, login, logout, getMe, refresh, updateMyProfile, changePassword, forgotPassword, verifyOTP, resetPassword } from '../controllers/auth.controller';
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
router.post('/register', upload.single('document'), register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected session lifecycle manipulations
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, upload.single('avatar'), updateMyProfile);
router.post('/change-password', requireAuth, changePassword);

export default router;
