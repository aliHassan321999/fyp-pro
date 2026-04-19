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

    // Validate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      response.status(400).json({ success: false, message: 'Email is already taken natively.' });
      return;
    }

    // Validate CNIC
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

    user.departmentId = department._id;
    await user.save();

    await ActivityLog.create({
      action: 'staff_assigned',
      performedBy: request.user?._id,
      targetUser: user._id,
      meta: { newDepartment: department._id }
    });

    response.status(200).json({ success: true, message: 'Staff successfully attached to target department.' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error tracking assignment.' });
  }
};

export const getStaffMembers = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
     const user = request.user!;
     const filter: any = { role: 'staff' };

     if (user.role === 'department_head') {
         filter.departmentId = user.departmentId;
     }

     const staff = await User.find(filter);
     
     const formattedStaff = staff.map(s => ({
        _id: s._id,
        name: s.profile?.fullName || s.email,
        departmentId: s.departmentId
     }));

     response.status(200).json({ success: true, count: formattedStaff.length, data: formattedStaff });
  } catch (error) {
     const err = error as Error;
     response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
