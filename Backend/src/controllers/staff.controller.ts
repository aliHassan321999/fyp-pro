import { Response } from 'express';
import { Complaint } from '../models/complaint.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/response';

export const getStaffDashboard = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    if (user.role !== 'staff') {
      return sendResponse(response, 403, false, 'Forbidden');
    }
    const userId = user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const [totalAssigned, inProgress, resolvedToday, slaAtRisk, myComplaints] = await Promise.all([
      Complaint.countDocuments({ assignedStaffId: userId }),
      Complaint.countDocuments({ assignedStaffId: userId, status: 'in_progress' }),
      Complaint.countDocuments({ 
        assignedStaffId: userId, 
        status: 'resolved', 
        resolvedAt: { $gte: startOfToday } 
      }),
      Complaint.countDocuments({
        assignedStaffId: userId,
        status: { $nin: ['resolved', 'closed'] },
        slaDeadline: { $gte: now, $lte: twoHoursFromNow }
      }),
      Complaint.find({ assignedStaffId: userId })
        .select('_id title status priority slaDeadline createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    const dashboardData = {
      stats: {
        totalAssigned,
        inProgress,
        resolvedToday,
        slaAtRisk
      },
      myComplaints
    };

    return sendResponse(response, 200, true, 'Staff dashboard retrieved successfully', dashboardData);
  } catch (error) {
    console.error('[getStaffDashboard] Error:', error);
    return sendResponse(response, 500, false, 'Server error retrieving staff dashboard');
  }
};
