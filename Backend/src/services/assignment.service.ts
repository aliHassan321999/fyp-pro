import mongoose from 'mongoose';
import { Complaint } from '../models/complaint.model';
import { User } from '../models/user.model';
import { ActivityLog } from '../models/activityLog.model';
import { Notification } from '../models/notification.model';

export const processAssignment = async (complaintId: string, staffId: string, performedByUserId: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const complaint = await Complaint.findById(complaintId).session(session);
    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status !== 'pending_assignment' && complaint.status !== 'assigned') {
      throw new Error('Invalid assignment state');
    }

    let isReassignment = false;
    let oldStaffId = null;

    if (complaint.assignedStaffId) {
      isReassignment = true;
      oldStaffId = complaint.assignedStaffId;

      if (complaint.reassignmentCount >= 3) {
        throw new Error('Reassignment limit reached');
      }

      if (complaint.lastAssignedAt) {
        const diffMs = new Date().getTime() - new Date(complaint.lastAssignedAt).getTime();
        const diffMins = diffMs / (1000 * 60);
        if (diffMins < 10) {
          throw new Error('Reassignment cooldown active');
        }
      }
    }

    const staff = await User.findById(staffId).session(session);
    if (!staff || staff.role !== 'staff') {
      throw new Error('Invalid staff member');
    }

    if (staff.departmentId?.toString() !== complaint.departmentId?.toString()) {
      throw new Error('Staff does not belong to this department');
    }

    const oldStatus = complaint.status;

    complaint.assignedStaffId = staff._id as any;
    complaint.status = 'assigned';
    
    if (isReassignment) {
      complaint.reassignmentCount = (complaint.reassignmentCount || 0) + 1;
      complaint.lastAssignedAt = new Date();
    } else {
      complaint.assignedAt = new Date();
      complaint.lastAssignedAt = new Date();
    }

    await complaint.save({ session });

    await ActivityLog.create([{
      complaintId: complaint._id,
      action: isReassignment ? 'reassigned' : 'assigned',
      performedBy: performedByUserId,
      oldValue: oldStatus,
      newValue: 'assigned',
      metadata: isReassignment ? {
        from: oldStaffId ? oldStaffId.toString() : undefined,
        to: staff._id.toString()
      } : {
        assignedTo: staff._id
      }
    }], { session });

    await Notification.create([{
      userId: staff._id,
      type: 'assignment',
      message: `You have been ${isReassignment ? 'reassigned' : 'assigned'} to complaint #${complaint._id.toString().slice(-6).toUpperCase()}: ${complaint.title}`
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return complaint;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
