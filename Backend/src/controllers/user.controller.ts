import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { Department } from '../models/department.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendEmail } from '../utils/email';

export const createStaff = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, cnic, departmentId } = request.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      response.status(400).json({ success: false, message: 'Email is already taken natively.' });
      return;
    }

    const existingCnic = await User.findOne({ 'profile.cnic': cnic });
    if (existingCnic) {
      response.status(400).json({ success: false, message: 'CNIC explicitly maps to another resident or staff.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'staff',
      rank: 'junior',
      accountStatus: 'active',
      departmentId: departmentId || null,
      profile: {
        fullName,
        phone,
        cnic
      }
    });

    await ActivityLog.create({
      action: 'staff_created',
      performedBy: request.user?._id,
      targetUser: newUser._id,
      departmentId: departmentId || undefined,
      meta: {
        departmentAssigned: !!departmentId
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

    response.status(201).json({ success: true, data: userPayload, message: 'Staff member created securely and email dispatched.' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error globally' });
  }
};

export const assignStaffDepartment = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    const { departmentId } = request.body;

    const user = await User.findById(id);
    if (!user) {
      response.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }
    if (user.role !== 'staff') {
      response.status(400).json({ success: false, message: 'Target user is not a staff member.' });
      return;
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      response.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }

    user.departmentId = department._id as any;
    await user.save();

    await ActivityLog.create({
      action: 'staff_assigned',
      performedBy: request.user?._id,
      targetUser: user._id,
      departmentId: department._id,
      meta: { newDepartment: department._id }
    });

    response.status(200).json({ success: true, message: 'Staff successfully attached to target department.' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error tracking assignment.' });
  }
};

/**
 * GET /users/staff
 * Returns staff list. Supports:
 *   ?unassigned=true  → staff with no department
 *   ?departmentId=xxx → staff in a specific department (for transfer modal)
 */
export const getStaffMembers = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
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

    response.status(200).json({ success: true, count: formattedStaff.length, data: formattedStaff });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * PATCH /users/:id/promote
 * Cycles rank: junior → standard → senior.
 * Rejects if already senior. Logs the promotion.
 */
export const promoteStaff = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);
    if (!user) {
      response.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    if (user.role !== 'staff') {
      response.status(400).json({ success: false, message: 'Promotion is only applicable to staff members.' });
      return;
    }

    const rankProgression: Record<string, string> = {
      junior: 'standard',
      standard: 'senior'
    };

    const currentRank = user.rank || 'junior';
    const nextRank = rankProgression[currentRank];

    if (!nextRank) {
      response.status(400).json({ success: false, message: 'This staff member is already at the highest rank (Senior).' });
      return;
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

    response.status(200).json({
      success: true,
      message: `${user.profile?.fullName || user.email} has been promoted from ${oldRank} to ${nextRank}.`,
      data: { newRank: nextRank }
    });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to promote staff member.' });
  }
};

/**
 * PATCH /users/:id/remove-department
 * Sets departmentId to null, effectively removing staff from their department.
 * Blocked if the user is currently the department head.
 */
export const removeStaffFromDepartment = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;

    const user = await User.findById(id);
    if (!user) {
      response.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    if (user.role !== 'staff') {
      response.status(400).json({ success: false, message: 'Only staff members can be removed from a department.' });
      return;
    }

    if (!user.departmentId) {
      response.status(400).json({ success: false, message: 'This staff member is not assigned to any department.' });
      return;
    }

    // Block removal if this user is the current department head
    const { Department } = await import('../models/department.model');
    const dept = await Department.findOne({ headOfDepartment: user._id });
    if (dept) {
      response.status(400).json({
        success: false,
        message: `Cannot remove ${user.profile?.fullName || user.email} — they are the current head of "${dept.name}". Assign a new head first.`
      });
      return;
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

    response.status(200).json({ success: true, message: `${user.profile?.fullName || user.email} has been removed from their department.` });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to remove staff from department.' });
  }
};
