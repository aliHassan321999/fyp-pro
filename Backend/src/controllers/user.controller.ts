import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { Department } from '../models/department.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email';
import { sendResponse } from '../utils/response';

/**
 * GET /users/:id
 * Fetch a single user by ID with populated relationships
 */
export const getUserById = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const user = await User.findById(id)
      .select('-password')
      .populate('departmentId', 'name')
      .lean();

    if (!user) {
      return sendResponse(response, 404, false, 'User not found.');
    }

    // Format response with consistent field names
    const formattedUser = {
      _id: user._id,
      email: user.email,
      name: user.profile?.fullName || user.email,
      profile: user.profile,
      role: user.role,
      departmentId: user.departmentId,
      rank: user.rank,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return sendResponse(response, 200, true, 'User retrieved successfully', formattedUser);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

export const createStaff = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { fullName, email, password, phone, cnic, departmentId, rank } = request.body;
    const user = request.user!;

    // Department head can only create junior/standard staff, not senior
    if (user.role === 'department_head' && (rank === 'senior' || !rank)) {
      return sendResponse(response, 403, false, 'Department heads can only create junior or standard rank staff. Senior staff must be created by admin.');
    }

    // Department head can only create staff for their own department
    if (user.role === 'department_head' && departmentId !== user.departmentId?.toString()) {
      return sendResponse(response, 403, false, 'You can only create staff for your own department.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(response, 400, false, 'Email is already taken.');
    }

    const existingCnic = await User.findOne({ 'profile.cnic': cnic });
    if (existingCnic) {
      return sendResponse(response, 400, false, 'CNIC already exists in the system.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'staff',
      rank: rank || 'junior',
      accountStatus: 'active',
      departmentId: departmentId || (user.role === 'department_head' ? user.departmentId : null),
      profile: {
        fullName,
        phone,
        cnic
      }
    });

    await ActivityLog.create({
      action: 'staff_created',
      performedBy: user._id,
      targetUser: newUser._id,
      departmentId: departmentId || (user.role === 'department_head' ? user.departmentId : undefined),
      meta: {
        departmentAssigned: !!departmentId || user.role === 'department_head',
        rank: rank || 'junior'
      }
    });

    try {
      await sendEmail({
        to: email,
        subject: "Your Staff Account Has Been Created",
        message: `Hello ${fullName},

Your staff account has been successfully created on the Complaint Management System.

Here are your login credentials:

  Email:              ${email}
  Temporary Password: ${password}

IMPORTANT: Please change your password after your first login to keep your account secure.

If you have any questions, please contact the administration team.

Best regards,
Administration Team`
      });
    } catch (emailErr) {
      console.log('[MAIL FALLBACK] SMTP unavailable — staff credentials logged below:');
      console.log(`  Email: ${email} | Temporary Password: ${password}`);
    }

    const userPayload = newUser.toObject();
    delete userPayload.password;

    return sendResponse(response, 201, true, 'Staff member created successfully.', userPayload);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

export const assignStaffDepartment = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const { departmentId } = request.body;
    const user = request.user!;

    console.log('🔄 [Staff Assignment] Starting assignment:', { staffId: id, departmentId, performedBy: user._id });

    // Department head can only assign to their own department
    if (user.role === 'department_head' && user.departmentId?.toString() !== departmentId) {
      return sendResponse(response, 403, false, 'You can only assign staff to your own department.');
    }

    const staffMember = await User.findById(id);
    if (!staffMember) {
      return sendResponse(response, 404, false, 'Staff member not found.');
    }
    if (staffMember.role !== 'staff') {
      return sendResponse(response, 400, false, 'Target user is not a staff member.');
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return sendResponse(response, 404, false, 'Department not found.');
    }

    staffMember.departmentId = department._id as any;
    await staffMember.save();
    console.log('✅ [Staff Assignment] Staff member updated in database');

    const logEntry = await ActivityLog.create({
      action: 'staff_assigned',
      performedBy: user._id,
      targetUser: staffMember._id,
      departmentId: department._id,
      meta: { newDepartment: department._id }
    });
    console.log('✅ [Staff Assignment] Activity log created:', logEntry._id);

    return sendResponse(response, 200, true, 'Staff successfully assigned to department.');
  } catch (error) {
    const err = error as Error;
    console.error('❌ [Staff Assignment] Error:', err.message);
    return sendResponse(response, 500, false, err.message || 'Server error tracking assignment.');
  }
};

/**
 * GET /users/staff
 * Returns staff list. Supports:
 *   ?unassigned=true  → staff with no department
 *   ?departmentId=xxx → staff in a specific department (for transfer modal)
 */
export const getStaffMembers = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { unassigned, departmentId } = request.query;

    const filter: any = { role: 'staff' };

    if (unassigned === 'true') {
      // Unassigned pool — no department
      filter.$or = [{ departmentId: null }, { departmentId: { $exists: false } }];
    } else if (departmentId) {
      filter.departmentId = departmentId;
    } else if (user.role === 'department_head') {
      filter.departmentId = user.departmentId;
    }

    const staff = await User.find(filter)
      .select('profile.fullName email rank accountStatus departmentId createdAt')
      .populate('departmentId', 'name');

    const formattedStaff = staff.map(s => ({
      _id: s._id,
      name: s.profile?.fullName || s.email,
      email: s.email,
      rank: s.rank,
      accountStatus: s.accountStatus,
      departmentId: s.departmentId,
      createdAt: s.createdAt
    }));

    return sendResponse(response, 200, true, 'Staff members retrieved', formattedStaff);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * PATCH /users/:id/promote
 * Cycles rank: junior → standard → senior.
 * Rejects if already senior. Logs the promotion.
 */
export const promoteStaff = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(response, 404, false, 'Staff member not found.');
    }

    if (user.role !== 'staff') {
      return sendResponse(response, 400, false, 'Promotion is only applicable to staff members.');
    }

    const rankProgression: Record<string, string> = {
      junior: 'standard',
      standard: 'senior'
    };

    const currentRank = user.rank || 'junior';
    const nextRank = rankProgression[currentRank];

    if (!nextRank) {
      return sendResponse(response, 400, false, 'This staff member is already at the highest rank (Senior).');
    }

    const oldRank = currentRank;
    user.rank = nextRank as 'junior' | 'standard' | 'senior';
    await user.save();

    await ActivityLog.create({
      action: 'staff_promoted',
      performedBy: request.user?._id,
      targetUser: user._id,
      departmentId: user.departmentId as any,
      oldValue: oldRank,
      newValue: nextRank,
      meta: { staffName: user.profile?.fullName }
    });

    return sendResponse(response, 200, true, `${user.profile?.fullName || user.email} has been promoted from ${oldRank} to ${nextRank}.`, { newRank: nextRank });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to promote staff member.');
  }
};

/**
 * PATCH /users/:id/remove-department
 * Sets departmentId to null, effectively removing staff from their department.
 * Blocked if the user is currently the department head.
 */
export const removeStaffFromDepartment = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(response, 404, false, 'Staff member not found.');
    }

    if (user.role !== 'staff') {
      return sendResponse(response, 400, false, 'Only staff members can be removed from a department.');
    }

    if (!user.departmentId) {
      return sendResponse(response, 400, false, 'This staff member is not assigned to any department.');
    }

    // Block removal if this user is the current department head
    const { Department } = await import('../models/department.model');
    const dept = await Department.findOne({ headOfDepartment: user._id });
    if (dept) {
      return sendResponse(response, 400, false, `Cannot remove ${user.profile?.fullName || user.email} — they are the current head of "${dept.name}". Assign a new head first.`);
    }

    const oldDepartmentId = user.departmentId;
    user.departmentId = undefined;
    await user.save();

    await ActivityLog.create({
      action: 'staff_removed_from_department',
      performedBy: request.user?._id,
      targetUser: user._id,
      departmentId: oldDepartmentId as any,
      meta: { staffName: user.profile?.fullName }
    });

    return sendResponse(response, 200, true, `${user.profile?.fullName || user.email} has been removed from their department.`);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to remove staff from department.');
  }
};
