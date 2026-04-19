import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email';

/**
 * Handle resident and staff registration securely.
 */
export const register = async (request: Request, response: Response): Promise<void> => {
  try {
    const { email, password, role, profile, departmentId } = request.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.accountStatus === 'suspended') {
        if (existingUser.applicationVersion >= 3) {
          response.status(403).json({ success: false, message: 'Maximum re-application attempts exceeded globally.' });
          return;
        }

        const oldProfile = existingUser.profile;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Fully override parameters structurally
        existingUser.password = hashedPassword;
        existingUser.role = role;
        existingUser.profile = profile;
        existingUser.departmentId = departmentId;
        existingUser.accountStatus = 'pending';
        existingUser.applicationVersion = (existingUser.applicationVersion || 1) + 1;
        existingUser.rejectionReason = undefined;

        existingUser.statusHistory.push({ status: 'pending', changedAt: new Date() });

        await existingUser.save();

        // Log explicitly tracker bounds
        await ActivityLog.create({
          action: 'user_reapplied',
          performedBy: existingUser._id,
          targetUser: existingUser._id,
          newValue: `Version ${existingUser.applicationVersion}`,
          meta: {
            oldProfile,
            newProfile: profile,
            version: existingUser.applicationVersion
          }
        });

        // Non-blocking mail request hook executed explicitly after Native DB commitment
        try {
          await sendEmail({
            to: existingUser.email,
            subject: "Your Registration Has Been Received 🚀",
            message: `Welcome to the community! 👋

We are thrilled to let you know that your registration with the Complaint Management System has been successfully received.

Right now, your account is securely parked in our queue while our administration team performs a quick standard verification. 

🔎 What happens next?
You don't need to do anything! As soon as your account is approved, we will send you another email letting you know your digital access has been granted. 

We know waiting isn't fun, but this process is usually very fast. We promise to keep you updated every step of the way.

Thank you for your patience and trust in us!

Warm regards,
The Complaint Management Team`
          });
        } catch (emailError) {
          console.error("Email failed:", emailError);
        }

        response.status(200).json({
          success: true,
          message: 'Account application re-submitted successfully. Waiting for admin approval.'
        });
        return;
      } else {
        response.status(400).json({ success: false, message: 'Email already exists and is actively registered' });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      profile,
      departmentId,
      accountStatus: 'pending', // Force manual admin approval
      statusHistory: [{ status: 'pending', changedAt: new Date() }]
    });

    // Non-blocking mail request hook executed explicitly after Native DB commitment
    try {
      await sendEmail({
        to: user.email,
        subject: "Your Registration Has Been Received 🚀",
        message: `Welcome to the community! 👋

We are thrilled to let you know that your registration with the Complaint Management System has been successfully received.

Right now, your account is securely parked in our queue while our administration team performs a quick standard verification. 

🔎 What happens next?
You don't need to do anything! As soon as your account is approved, we will send you another email letting you know your digital access has been granted. 

We know waiting isn't fun, but this process is usually very fast. We promise to keep you updated every step of the way.

Thank you for your patience and trust in us!

Warm regards,
The Complaint Management Team`
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    response.status(201).json({
      success: true,
      message: 'Registration successful. Waiting for admin approval.'
    });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * =======================================================================
 * FUTURE APPROVAL EMAIL TEMPLATE (For Admin Approval Controller)
 * =======================================================================
 * Subject: "Your Account Has Been Approved 🎉"
 * 
 * Message:
 * Welcome to the community! 👋
 * 
 * Great news! 🎉
 * 
 * Your account has been officially approved by our administration team. You now have full, unrestricted access to the Complaint Management System!
 * 
 * You can immediately log in to your dashboard to submit new complaints, track ongoing resolutions natively in real time, and communicate directly with staff.
 * 
 * We are incredibly excited to have you onboard. If you ever need assistance navigating the portal, our support team is always just a click away.
 * 
 * Warm regards,
 * The Complaint Management Team
 * =======================================================================
 */

/**
 * Handle user authentication and strictly issues Dual Security Cookies.
 */
export const login = async (request: Request, response: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = request.body;

    const user = await User.findOne({ email: emailOrUsername }).select('+password');
    if (!user) {
      response.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    if (user.accountStatus !== 'active') {
      response.status(403).json({ success: false, message: 'Account is pending or suspended' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      response.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );
    const refreshTokenPayload = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    // Cryptography requirement: Hash refresh token BEFORE storing in DB
    const salt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshTokenPayload, salt);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const // Recommended format for functional navigation
    };

    response.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    response.cookie('refreshToken', refreshTokenPayload, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshToken;

    console.log('[AUTH CONTROLLER] Login Success. Issuing cookies and 200 OK for:', userObj.email);
    response.status(200).json({ success: true, data: userObj });
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] Server error during login:', error);
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Validates Refresh Tokens securely.
 */
export const refresh = async (request: Request, response: Response): Promise<void> => {
  try {
    const { refreshToken } = request.cookies;
    if (!refreshToken) {
      response.status(401).json({ success: false, message: 'Unauthorized - Missing Refresh Token' });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || user.accountStatus !== 'active' || !user.refreshToken) {
      response.status(401).json({ success: false, message: 'Unauthorized - Invalid session alignment' });
      return;
    }

    // Explicitly compare the plaintext refresh cookie against hashed refresh table payload
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      response.status(401).json({ success: false, message: 'Unauthorized - Suspicious Token Signature' });
      return;
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    response.status(200).json({ success: true, message: 'Access renewed seamlessly' });
  } catch (error) {
    response.status(401).json({ success: false, message: 'Unauthorized - Token parsing failed' });
  }
};

/**
 * Purge secure cookies unconditionally.
 */
export const logout = async (request: Request, response: Response): Promise<void> => {
  try {
    // Optionally delete from DB if tracking is strict
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    response.status(200).json({ success: true, message: 'Successfully logged out' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Read logic.
 */
export const getMe = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  console.log('[AUTH CONTROLLER] getMe requested. User object attached by middleware:', request.user?.email);
  try {
    response.status(200).json({ success: true, data: request.user });
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] getMe crashed:', error);
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
