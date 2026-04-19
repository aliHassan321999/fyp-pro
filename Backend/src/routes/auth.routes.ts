import express from 'express';
import { register, login, logout, getMe, refresh } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

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

export default router;
