import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email';
import { uploadBufferToCloudinary } from '../utils/cloudinary';
import { sendResponse } from '../utils/response';

/**
 * Handle resident and staff registration securely.
 */
export const register = async (request: Request, response: Response): Promise<any> => {
  try {
    const { email, password, role, profile, departmentId, fullName, phone, post } = request.body;
    // Extract proof document if provided
    const proofFile = (request as any).file as Express.Multer.File | undefined;
    let proofDocumentUrl: string | undefined;
    if (proofFile) {
      try {
        proofDocumentUrl = await uploadBufferToCloudinary(proofFile.buffer, 'proof-documents');
      } catch (err) {
        console.error('[REGISTER] Cloudinary upload failed:', err);
      }
    }

    // Build profile from flat payload if necessary (for Staff registration from UI)
    const builtProfile = profile || {};
    if (fullName) builtProfile.fullName = fullName;
    if (phone) builtProfile.phone = phone;
    if (post) builtProfile.position = post;
    builtProfile.proofDocumentUrl = proofDocumentUrl;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.accountStatus === 'suspended') {
        if (existingUser.applicationVersion >= 3) {
          return sendResponse(response, 403, false, 'Maximum re-application attempts exceeded globally.');
        }

        const oldProfile = existingUser.profile;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Fully override parameters structurally
        existingUser.password = hashedPassword;
        existingUser.role = role;
        existingUser.profile = builtProfile;
        existingUser.departmentId = departmentId;
        existingUser.accountStatus = role === 'resident' ? 'pending' : 'active';
        existingUser.applicationVersion = (existingUser.applicationVersion || 1) + 1;
        existingUser.rejectionReason = undefined;

        existingUser.statusHistory.push({ status: role === 'resident' ? 'pending' : 'active', changedAt: new Date() });

        await existingUser.save();

        // Log explicitly tracker bounds (non-blocking)
        try {
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
        } catch (logError) {
          console.error('[AUTH CONTROLLER] ActivityLog creation failed during re-registration:', logError);
        }

        // Non-blocking mail request hook executed explicitly after Native DB commitment
        try {
          if (role === 'resident') {
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
          }
        } catch (emailError) {
          console.error("Email failed:", emailError);
        }

        const msg = role === 'resident' 
          ? 'Account application re-submitted successfully. Waiting for admin approval.' 
          : 'Account updated successfully.';
        return sendResponse(response, 200, true, msg);
      } else {
        return sendResponse(response, 400, false, 'Email already exists and is actively registered');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      profile: builtProfile,
      departmentId,
      accountStatus: role === 'resident' ? 'pending' : 'active', // Force manual admin approval only for residents
      statusHistory: [{ status: role === 'resident' ? 'pending' : 'active', changedAt: new Date() }]
    });

    // Non-blocking mail request hook executed explicitly after Native DB commitment
    try {
      if (role === 'resident') {
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
      }
    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    const msg = role === 'resident' 
      ? 'Registration successful. Waiting for admin approval.' 
      : 'Account created and activated successfully.';
    return sendResponse(response, 201, true, msg);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
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
export const login = async (request: Request, response: Response): Promise<any> => {
  try {
    const { emailOrUsername, password } = request.body;

    const user = await User.findOne({ email: emailOrUsername }).select('+password');
    if (!user) {
      return sendResponse(response, 401, false, 'Invalid credentials');
    }

    if (user.accountStatus !== 'active') {
      return sendResponse(response, 403, false, 'Account is pending or suspended');
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return sendResponse(response, 401, false, 'Invalid credentials');
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

    // Log successful login (non-blocking)
    try {
      console.log('[LOGIN] Attempting to create ActivityLog for user:', user.email);
      const logEntry = await ActivityLog.create({
        action: 'user_login',
        performedBy: user._id,
        metadata: {
          email: user.email,
          role: user.role,
          ipAddress: request.ip || 'unknown'
        }
      });
      console.log('[LOGIN] ✅ ActivityLog created successfully:', logEntry._id);
    } catch (logError) {
      console.error('[AUTH CONTROLLER] ActivityLog creation failed, but login continues:', logError);
    }

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
    return sendResponse(response, 200, true, 'Login successful', userObj);
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] Server error during login:', error);
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Validates Refresh Tokens securely.
 */
export const refresh = async (request: Request, response: Response): Promise<any> => {
  try {
    const { refreshToken } = request.cookies;
    if (!refreshToken) {
      return sendResponse(response, 401, false, 'Unauthorized - Missing Refresh Token');
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || user.accountStatus !== 'active' || !user.refreshToken) {
      return sendResponse(response, 401, false, 'Unauthorized - Invalid session alignment');
    }

    // Explicitly compare the plaintext refresh cookie against hashed refresh table payload
    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      return sendResponse(response, 401, false, 'Unauthorized - Suspicious Token Signature');
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });

    return sendResponse(response, 200, true, 'Access renewed seamlessly');
  } catch (error) {
    return sendResponse(response, 401, false, 'Unauthorized - Token parsing failed');
  }
};

/**
 * Purge secure cookies unconditionally.
 */
export const logout = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    // Log user logout (non-blocking)
    if (request.user) {
      try {
        await ActivityLog.create({
          action: 'user_logout',
          performedBy: request.user._id,
          metadata: {
            email: request.user.email,
            role: request.user.role
          }
        });
      } catch (logError) {
        console.error('[AUTH CONTROLLER] ActivityLog creation failed during logout:', logError);
      }
    }
    
    // Optionally delete from DB if tracking is strict
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return sendResponse(response, 200, true, 'Successfully logged out');
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Read logic.
 */
export const getMe = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  console.log('[AUTH CONTROLLER] getMe requested. User object attached by middleware:', request.user?.email);
  try {
    return sendResponse(response, 200, true, 'Profile retrieved', request.user);
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] getMe crashed:', error);
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Update current user profile securely.
 */
export const updateMyProfile = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { fullName, phone, block, houseNumber } = request.body;
    
    // Strict requirement: Full name is conceptually mandatory for profile sync
    if (!fullName) {
      return sendResponse(response, 400, false, 'Full name is strictly required.');
    }

    const user = await User.findById(request.user?._id);
    if (!user) {
      return sendResponse(response, 404, false, 'Identity not found in database.');
    }

    // Safety: ensure profile + address containers exist
    if (!user.profile) user.profile = { cnic: (user as any).profile?.cnic || 'N/A' };
    if (!user.profile.address) user.profile.address = { block: '', houseNumber: '' };

    // Handle Binary Avatar Payload via Cloudinary Integration
    if (request.file) {
      try {
        const avatarUrl = await uploadBufferToCloudinary(request.file.buffer, 'profiles');
        // Use Mongoose .set() to ensure nested property updates bypass any schema strictness issues
        user.set('profile.profileImage', avatarUrl);
      } catch (cloudinaryErr) {
        console.error('[PROFILE SYNC] Cloudinary Upload Failure:', cloudinaryErr);
      }
    }

    // Secure Field Mapping (Manual keys prevent over-posting vulnerabilities)
    if (fullName) user.set('profile.fullName', fullName);
    if (phone) user.set('profile.phone', phone);
    if (block) user.set('profile.address.block', block);
    if (houseNumber) user.set('profile.address.houseNumber', houseNumber);

    // Explicitly mark the profile object as modified for Mongoose
    user.markModified('profile');

    // Persist changes
    await user.save();

    console.log('[AUTH CONTROLLER] Profile Updated for:', user.email);
    console.log('[AUTH CONTROLLER] Updated Profile Image:', user.profile?.profileImage);
    
    // Return safe object (Schema .toObject already handles sensitive field stripping)
    return sendResponse(response, 200, true, 'Profile synchronized successfully! ✅', user);
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] updateMyProfile crashed:', error);
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error during profile update');
  }
};

/**
 * Change current user's password securely.
 */
export const changePassword = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { currentPassword, newPassword } = request.body;

    if (!currentPassword || !newPassword) {
      return sendResponse(response, 400, false, 'Current and new password are required');
    }

    // Get the user with the password field explicitly selected
    const user = await User.findById(request.user?._id).select('+password');
    if (!user) {
      return sendResponse(response, 404, false, 'User not found');
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
      return sendResponse(response, 400, false, 'Incorrect current password');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Optionally log this action
    try {
      await ActivityLog.create({
        action: 'password_changed',
        performedBy: user._id,
      });
    } catch (logError) {
      console.error('[AUTH CONTROLLER] ActivityLog creation failed for password change:', logError);
    }

    return sendResponse(response, 200, true, 'Password successfully updated');
  } catch (error) {
    console.error('[AUTH CONTROLLER FATAL] changePassword crashed:', error);
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

export const forgotPassword = async (request: Request, response: Response): Promise<any> => {
  try {
    const { email } = request.body;
    if (!email) return sendResponse(response, 400, false, 'Email is required');

    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(response, 404, false, 'User account not found with this email.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    console.log(`\n\n[DEV-TESTING] OTP FOR ${user.email} IS: ${otp}\n\n`);

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Code",
        message: `Your password reset code is: ${otp}\nThis code will expire in 10 minutes.`
      });
    } catch (e) {
      console.error('Failed to send email:', e);
    }

    return sendResponse(response, 200, true, 'If an account with that email exists, we sent a reset code.');
  } catch (error) {
    console.error('[AUTH CONTROLLER] forgotPassword failed:', error);
    return sendResponse(response, 500, false, 'Server error');
  }
};

export const verifyOTP = async (request: Request, response: Response): Promise<any> => {
  try {
    const { email, otp } = request.body;
    
    if (!email || !otp) {
      return sendResponse(response, 400, false, 'Email and OTP are required');
    }

    const user = await User.findOne({ email, resetOTP: otp, resetOTPExpires: { $gt: new Date() } });
    if (!user) {
      return sendResponse(response, 400, false, 'Invalid or expired OTP');
    }

    // OTP is valid. We don't delete it yet, we wait for the actual password reset.
    return sendResponse(response, 200, true, 'OTP verified successfully');
  } catch (error) {
    console.error('[AUTH CONTROLLER] verifyOTP failed:', error);
    return sendResponse(response, 500, false, 'Server error');
  }
};

export const resetPassword = async (request: Request, response: Response): Promise<any> => {
  try {
    const { email, otp, newPassword } = request.body;
    
    if (!email || !otp || !newPassword) {
      return sendResponse(response, 400, false, 'Email, OTP, and new password are required');
    }

    const user = await User.findOne({ email, resetOTP: otp, resetOTPExpires: { $gt: new Date() } });
    if (!user) {
      return sendResponse(response, 400, false, 'Invalid or expired OTP');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    await user.save();

    return sendResponse(response, 200, true, 'Password has been reset successfully');
  } catch (error) {
    console.error('[AUTH CONTROLLER] resetPassword failed:', error);
    return sendResponse(response, 500, false, 'Server error');
  }
};
