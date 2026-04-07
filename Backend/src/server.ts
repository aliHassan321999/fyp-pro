import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import departmentRoutes from './routes/department.routes';
import staffRoutes from './routes/staff.routes';
import notificationRoutes from './routes/notification.routes';
import { connectDB } from './config/database';
import { startSlaMonitorJob } from './jobs/slaMonitor.job';

dotenv.config();

// Critical Environment Validation
if (!process.env.JWT_SECRET) {
  console.error('[FATAL SERVER ERROR] JWT_SECRET is missing from environment variables. Stopping server to prevent exposed cookies.');
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET) {
  console.error('[FATAL SERVER ERROR] JWT_REFRESH_SECRET is missing from environment variables. Stopping server.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware - Helmet provides multiple security headers
app.use(helmet());

// Middleware Application
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Crucial for HTTP-only cookies
  })
);

// Rate Limiting Middleware - Security Enhancement
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 login/register attempts per windowMs (increased for development)
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply rate limiting to all requests
app.use(generalLimiter);

// Route Registration
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler Array fallback
app.use((err: Error, request: Request, response: Response, next: NextFunction) => {
  console.error('[Global Error Handler Triggered]:', err.message);
  response.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// Database Start & Server Listener
const startServer = async () => {
  try {
    await connectDB();
    
    // Start background jobs
    startSlaMonitorJob();

    app.listen(PORT, () => {
      console.log(`[Server] Live and listening securely on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server Ignition Error] DB failed to connect', error);
    process.exit(1);
  }
};

startServer();
# commit-marker: [2026-03-02 10:30:00] Setup Express server with TypeScript
# commit-marker: [2026-03-27 14:00:00] Add email notification service with Nodemailer
# commit-marker: [2026-03-28 10:15:00] Configure SMTP transport for complaint alerts
# commit-marker: [2026-04-07 13:15:00] Add complaint priority escalation cron job
