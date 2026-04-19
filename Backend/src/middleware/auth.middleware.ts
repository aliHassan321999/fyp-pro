import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { IUser } from '../interfaces/user.interface';

// Extend Express Request globally to support attaching the user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
}

export const requireAuth = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from HTTP-only cookies
    const token = request.cookies?.accessToken;
    console.log('[AUTH MIDDLEWARE] Extracted Token:', token ? 'Found' : 'Missing');

    if (!token) {
      response.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided'
      });
      return;
    }

    // Verify token using secret
    console.log('[AUTH MIDDLEWARE] Attempting JWT Verification with local secret length:', process.env.JWT_SECRET?.length);
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    console.log('[AUTH MIDDLEWARE] Token Verified. Decoded ID:', decoded.id);

    // Retrieve user and attach to request
    const user = await User.findById(decoded.id).select('-password');
    console.log('[AUTH MIDDLEWARE] User Lookup result:', user ? user.email : 'Not Found');


    if (!user) {
      response.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid session'
      });
      return;
    }

    // Check if account is active
    if (user.accountStatus !== 'active') {
      response.status(403).json({
        success: false,
        message: 'Forbidden - Account is not active'
      });
      return;
    }

    // Attach verified user instance directly to request for downstream handlers
    request.user = user;
    console.log('[AUTH MIDDLEWARE] Authentication Approved for:', user.email);
    next();
  } catch (error: any) {
    console.error('[AUTH MIDDLEWARE FATAL] JWT Verification Crashed:', error.message);
    // Catches expired or malformed JWTs
    response.status(401).json({ 
      success: false, 
      message: 'Unauthorized - Invalid or expired token' 
    });
  }
};

/**
 * Higher-order middleware factory intercepting execution based on explicit User Roles arrays.
 */
export const requireRole = (roles: string[]) => {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    if (!request.user) {
      response.status(401).json({
        success: false,
        message: 'Unauthorized - Cannot verify roles without active session'
      });
      return;
    }

    if (!roles.includes(request.user.role)) {
      response.status(403).json({
        success: false,
        message: `Forbidden - Insufficient permissions. Target execution requires explicitly one of: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};
