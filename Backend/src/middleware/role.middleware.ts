import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '../interfaces/user.interface';
import { Complaint } from '../models/complaint.model';

/**
 * Validates that the logged-in user holds one of the required roles.
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  const rolesArray = allowedRoles;

  return (request: AuthenticatedRequest, response: Response, next: NextFunction): void => {
    const user = request.user;

    if (!user) {
       response.status(401).json({ success: false, message: 'Unauthorized - User not found on request' });
       return;
    }

    // Check if user's role matches any in the allowed array
    if (!rolesArray.includes(user.role as UserRole)) {
       response.status(403).json({ 
        success: false, 
        message: `Forbidden - Requires one of the following roles: ${rolesArray.join(', ')}` 
      });
       return;
    }

    next();
  };
};

/**
 * Ensures that a resident is only acting upon complaints they own.
 * Can be plugged into complaint-specific PUT/DELETE/GET routes.
 */
export const requireComplaintOwnership = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = request.user;
    const complaintId = request.params.id;

    if (!user) {
      response.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Admin bypasses ownership constraints entirely
    if (user.role === 'admin') {
      next();
      return;
    }

    // Lookup complaint with full ownership footprint
    const complaint = await Complaint.findById(complaintId).select('residentId departmentId assignedStaffId');

    if (!complaint) {
      response.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }

    // Resident -> Can only access their own complaints
    if (user.role === 'resident' && complaint.residentId.toString() !== user._id.toString()) {
      response.status(403).json({ success: false, message: 'Forbidden - You do not own this complaint' });
      return;
    }

    // Department Head -> Can only access complaints within their department
    if (user.role === 'department_head' && complaint.departmentId.toString() !== user.departmentId?.toString()) {
      response.status(403).json({ success: false, message: 'Forbidden - Complaint does not belong to your department' });
      return;
    }

    // Staff -> Can only access complaints explicitly assigned to them
    if (user.role === 'staff' && complaint.assignedStaffId?.toString() !== user._id.toString()) {
      response.status(403).json({ success: false, message: 'Forbidden - Complaint is not assigned to you' });
      return;
    }

    // If it passes all explicit checks, proceed
    next();
  } catch (error) {
    response.status(500).json({ success: false, message: 'Server error processing ownership' });
  }
};
