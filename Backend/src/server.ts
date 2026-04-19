import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import complaintRoutes from './routes/complaint.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import departmentRoutes from './routes/department.routes';
import { connectDB } from './config/database';

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

// Middleware Application
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Frontend URL
    credentials: true, // Crucial for HTTP-only cookies
  })
);

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/departments', departmentRoutes);

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

    app.listen(PORT, () => {
      console.log(`[Server] Live and listening securely on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Server Ignition Error] DB failed to connect', error);
    process.exit(1);
  }
};

startServer();
