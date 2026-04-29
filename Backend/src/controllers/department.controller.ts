import mongoose from 'mongoose';
import { Response } from 'express';
import { Department } from '../models/department.model';
import { User } from '../models/user.model';
import { Complaint } from '../models/complaint.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/response';

export const createDepartment = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    let { name, slaTargetHours, description } = request.body;

    name = name?.trim();
    description = description?.trim();

    if (!name || slaTargetHours === undefined) {
      return sendResponse(response, 400, false, 'Name and SLA Target Hours are strictly required.');
    }

    if (name.length > 100) {
      return sendResponse(response, 400, false, 'Department name cannot exceed 100 characters.');
    }

    if (description && description.length > 300) {
      return sendResponse(response, 400, false, 'Description cannot exceed 300 characters.');
    }

    const slaNum = Number(slaTargetHours);
    if (!Number.isFinite(slaNum) || slaNum <= 0 || slaNum > 720) {
      return sendResponse(response, 400, false, 'SLA must be a valid number between 1 and 720 hours.');
    }

    const existingName = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingName) {
      return sendResponse(response, 400, false, 'Department already exists');
    }

    const newDepartment = await Department.create({
      name,
      slaTargetHours: slaNum,
      description,
      headOfDepartment: undefined,
      createdBy: request.user?._id
    });

    return sendResponse(response, 201, true, 'Department created successfully.', newDepartment);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Something went wrong');
  }
};

export const getDepartments = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const departments = await Department.find()
      .populate('headOfDepartment', 'profile.fullName email')
      .sort({ createdAt: -1 });

    const departmentsWithStats = await Promise.all(departments.map(async (dept) => {
      const staffCount = await User.countDocuments({
        departmentId: dept._id,
        role: 'staff'
      });
      return {
        ...dept.toObject(),
        staffCount
      };
    }));

    return sendResponse(response, 200, true, 'Departments retrieved successfully.', departmentsWithStats);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Something went wrong while fetching departments.');
  }
};

/**
 * GET /departments/:id
 * Returns a single department with head populated, staff count, and SLA metrics
 */
export const getDepartmentById = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const department = await Department.findById(id)
      .populate('headOfDepartment', 'profile.fullName email rank');

    if (!department) {
      return sendResponse(response, 404, false, 'Department not found.');
    }

    const staffCount = await User.countDocuments({ departmentId: id, role: 'staff' });

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(now.getDate() - 60);

    // Current period SLA metrics (last 30 days)
    const [currentMetrics] = await Complaint.aggregate([
      {
        $match: {
          departmentId: department._id,
          createdAt: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: null,
          totalResolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          slaOnTime: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'resolved'] }, { $lte: ['$resolvedAt', '$slaDeadline'] }] },
                1, 0
              ]
            }
          },
          slaBreached: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $and: [{ $eq: ['$status', 'resolved'] }, { $gt: ['$resolvedAt', '$slaDeadline'] }] },
                    { $and: [{ $ne: ['$status', 'resolved'] }, { $lt: ['$slaDeadline', now] }] }
                  ]
                },
                1, 0
              ]
            }
          },
          avgResolutionMs: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'resolved'] },
                { $subtract: ['$resolvedAt', '$createdAt'] },
                null
              ]
            }
          }
        }
      }
    ]);

    const [prevMetrics] = await Complaint.aggregate([
      {
        $match: {
          departmentId: department._id,
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalResolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          slaOnTime: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'resolved'] }, { $lte: ['$resolvedAt', '$slaDeadline'] }] },
                1, 0
              ]
            }
          }
        }
      }
    ]);

    const currTotal = currentMetrics?.totalResolved ?? 0;
    const currOnTime = currentMetrics?.slaOnTime ?? 0;
    const currBreached = currentMetrics?.slaBreached ?? 0;
    const complianceRate = currTotal > 0 ? Number(((currOnTime / currTotal) * 100).toFixed(1)) : 0;
    const avgResolutionHours = currentMetrics?.avgResolutionMs
      ? Number((currentMetrics.avgResolutionMs / (1000 * 60 * 60)).toFixed(1))
      : 0;

    const prevTotal = prevMetrics?.totalResolved ?? 0;
    const prevOnTime = prevMetrics?.slaOnTime ?? 0;
    const prevCompliance = prevTotal > 0 ? (prevOnTime / prevTotal) * 100 : 0;
    const currCompliance = currTotal > 0 ? (currOnTime / currTotal) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currCompliance > prevCompliance + 2) trend = 'up';
    else if (currCompliance < prevCompliance - 2) trend = 'down';

    return sendResponse(response, 200, true, 'Department details retrieved', {
      ...department.toObject(),
      staffCount,
      slaMetrics: {
        complianceRate,
        totalResolved: currTotal,
        totalBreached: currBreached,
        avgResolutionHours,
        trend
      }
    });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to fetch department.');
  }
};

/**
 * GET /departments/:id/staff
 */
export const getDepartmentStaff = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const staffList = await User.find({ departmentId: id, role: { $in: ['staff', 'department_head'] } })
      .select('profile.fullName email rank role accountStatus createdAt');

    if (staffList.length === 0) {
      return sendResponse(response, 200, true, 'No staff found for this department', []);
    }

    const staffIds = staffList.map(s => s._id);
    const now = new Date();

    const statsAgg = await Complaint.aggregate([
      { $match: { assignedStaffId: { $in: staffIds } } },
      {
        $group: {
          _id: '$assignedStaffId',
          assignedCount: {
            $sum: { $cond: [{ $in: ['$status', ['assigned', 'in_progress']] }, 1, 0] }
          },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          slaBreaches: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $and: [{ $eq: ['$status', 'resolved'] }, { $gt: ['$resolvedAt', '$slaDeadline'] }] },
                    { $and: [{ $ne: ['$status', 'resolved'] }, { $lt: ['$slaDeadline', now] }] }
                  ]
                },
                1, 0
              ]
            }
          },
          slaOnTime: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$status', 'resolved'] }, { $lte: ['$resolvedAt', '$slaDeadline'] }] },
                1, 0
              ]
            }
          },
          lastActivityAt: { $max: '$updatedAt' }
        }
      }
    ]);

    const statsMap = new Map(statsAgg.map(s => [s._id.toString(), s]));

    const enriched = staffList.map(staff => {
      const s = statsMap.get(staff._id.toString());
      const resolvedCount = s?.resolvedCount ?? 0;
      const slaOnTime = s?.slaOnTime ?? 0;
      const complianceRate = resolvedCount > 0
        ? Number(((slaOnTime / resolvedCount) * 100).toFixed(1))
        : 0;

      return {
        _id: staff._id,
        email: staff.email,
        rank: staff.rank,
        accountStatus: staff.accountStatus,
        profile: staff.profile,
        createdAt: staff.createdAt,
        stats: {
          assignedCount: s?.assignedCount ?? 0,
          resolvedCount,
          slaBreaches: s?.slaBreaches ?? 0,
          complianceRate,
          lastActivityAt: s?.lastActivityAt ?? null
        }
      };
    });

    return sendResponse(response, 200, true, 'Department staff retrieved successfully.', enriched);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to fetch department staff.');
  }
};

/**
 * PATCH /departments/:id/assign-head
 */
export const assignHead = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const { staffId } = request.body;

    if (!staffId) {
      return sendResponse(response, 400, false, 'staffId is required.');
    }

    const department = await Department.findById(id);
    if (!department) {
      return sendResponse(response, 404, false, 'Department not found.');
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      return sendResponse(response, 404, false, 'Staff member not found.');
    }

    if (staff.role !== 'staff' && staff.role !== 'department_head') {
      return sendResponse(response, 400, false, 'Only staff or department heads can be assigned as head.');
    }

    if (staff.departmentId?.toString() !== id) {
      return sendResponse(response, 400, false, 'Staff member must belong to this department to become head.');
    }

    const previousHeadId = department.headOfDepartment;
    
    // Update roles for correct permissions
    if (previousHeadId && previousHeadId.toString() !== staff._id.toString()) {
      await User.findByIdAndUpdate(previousHeadId, { role: 'staff' });
    }
    
    staff.role = 'department_head';
    await staff.save();

    department.headOfDepartment = staff._id as any;
    await department.save();

    await ActivityLog.create({
      action: 'head_assigned',
      performedBy: request.user?._id,
      targetUser: staff._id,
      departmentId: department._id,
      oldValue: previousHeadId?.toString() || 'none',
      newValue: staff._id.toString(),
      meta: { departmentName: department.name }
    });

    return sendResponse(response, 200, true, `${staff.profile?.fullName || staff.email} has been assigned as department head.`);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to assign department head.');
  }
};

/**
 * PATCH /departments/:id
 */
export const updateDepartment = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    let { name, slaTargetHours, description } = request.body;

    name = name?.trim();
    description = description?.trim();

    const department = await Department.findById(id);
    if (!department) {
      return sendResponse(response, 404, false, 'Department not found.');
    }

    if (name && name !== department.name) {
      if (name.length > 100) {
        return sendResponse(response, 400, false, 'Department name cannot exceed 100 characters.');
      }
      const conflict = await Department.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      if (conflict) {
        return sendResponse(response, 400, false, 'Another department with this name already exists.');
      }
      department.name = name;
    }

    if (slaTargetHours !== undefined) {
      const slaNum = Number(slaTargetHours);
      if (!Number.isFinite(slaNum) || slaNum <= 0 || slaNum > 720) {
        return sendResponse(response, 400, false, 'SLA must be between 1 and 720 hours.');
      }
      department.slaTargetHours = slaNum;
    }

    if (description !== undefined) {
      if (description.length > 300) {
        return sendResponse(response, 400, false, 'Description cannot exceed 300 characters.');
      }
      department.description = description;
    }

    await department.save();

    await ActivityLog.create({
      action: 'department_updated',
      performedBy: request.user?._id,
      departmentId: department._id,
      meta: { updatedFields: Object.keys(request.body) }
    });

    return sendResponse(response, 200, true, 'Department updated successfully.', department);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Failed to update department.');
  }
};

/**
 * GET /departments/:id/recommend-staff
 */
export const recommendStaff = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;

    const staffAgg = await User.aggregate([
      {
        $match: {
          departmentId: new mongoose.Types.ObjectId(id as string),
          role: 'staff',
          accountStatus: 'active'
        }
      },
      {
        $lookup: {
          from: 'complaints',
          localField: '_id',
          foreignField: 'assignedStaffId',
          as: 'ticketHistory'
        }
      },
      {
        $addFields: {
          activeComplaints: {
            $size: {
              $filter: {
                input: '$ticketHistory',
                cond: { $in: ['$$this.status', ['assigned', 'in_progress']] }
              }
            }
          },
          resolvedTotal: {
            $size: {
              $filter: {
                input: '$ticketHistory',
                cond: { $in: ['$$this.status', ['resolved', 'closed']] }
              }
            }
          },
          resolvedOnTime: {
            $size: {
              $filter: {
                input: '$ticketHistory',
                cond: {
                  $and: [
                    { $in: ['$$this.status', ['resolved', 'closed']] },
                    { $lte: ['$$this.resolvedAt', '$$this.slaDeadline'] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          profile: 1,
          email: 1,
          activeComplaints: 1,
          resolvedTotal: 1,
          resolvedOnTime: 1
        }
      }
    ]);

    const rankedStaff = staffAgg.map(staff => {
      let score_W = 0;
      let score_SLA = 0;
      let score_A = 0;

      if (staff.activeComplaints >= 10) {
        score_W = -50;
      } else {
        score_W = Math.max(0, 40 - (Math.pow(staff.activeComplaints, 1.3) * 3));
      }

      if (staff.resolvedTotal === 0) {
        score_SLA = 25;
      } else {
        score_SLA = (staff.resolvedOnTime / staff.resolvedTotal) * 40;
      }

      if (staff.activeComplaints === 0) {
        score_A = 20;
      } else if (staff.activeComplaints < 3) {
        score_A = 15;
      } else {
        score_A = 5;
      }

      const matchScore = Number((score_W + score_SLA + score_A).toFixed(1));
      const slaComplianceRate = staff.resolvedTotal > 0 ? Number(((staff.resolvedOnTime / staff.resolvedTotal) * 100).toFixed(1)) : 0;

      return {
        staffId: staff._id,
        fullName: staff.profile?.fullName || 'Unknown Unit',
        email: staff.email,
        metrics: {
          activeComplaints: staff.activeComplaints,
          slaComplianceRate,
          matchScore
        }
      };
    });

    rankedStaff.sort((a, b) => {
      if (b.metrics.matchScore !== a.metrics.matchScore) return b.metrics.matchScore - a.metrics.matchScore;
      if (b.metrics.slaComplianceRate !== a.metrics.slaComplianceRate) return b.metrics.slaComplianceRate - a.metrics.slaComplianceRate;
      return a.metrics.activeComplaints - b.metrics.activeComplaints;
    });

    const topRecommendations = rankedStaff.slice(0, 3);

    return sendResponse(response, 200, true, 'Staff recommendations retrieved successfully.', topRecommendations);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server Exception ranking operators');
  }
};

/**
 * Retrieve specialized dashboard metrics for the Department Head
 * Strict role and boundary constraints applied.
 */
export const getDepartmentHeadDashboard = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;

    if (!user.departmentId) {
      return sendResponse(response, 403, false, 'User is not assigned to a valid department footprint.');
    }

    const deptId = user.departmentId;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Parallel optimized query execution avoiding N+1 blocks
    const [unassigned, inProgress, resolvedToday, slaAtRisk, recentComplaints] = await Promise.all([
      Complaint.countDocuments({ departmentId: deptId, status: 'pending_assignment' }),
      Complaint.countDocuments({ departmentId: deptId, status: 'in_progress' }),
      Complaint.countDocuments({ departmentId: deptId, status: 'resolved', resolvedAt: { $gte: startOfToday } }),
      Complaint.countDocuments({
        departmentId: deptId,
        status: { $nin: ['resolved', 'closed'] }, // Safe logic matching requirement logic
        slaDeadline: { $lte: twoHoursFromNow }
      }),
      Complaint.find({ departmentId: deptId })
        .select('_id title status priority slaDeadline assignedStaffId departmentId createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const dashboardData = {
      stats: {
        unassigned,
        inProgress,
        resolvedToday,
        slaAtRisk
      },
      recentComplaints
    };

    return sendResponse(response, 200, true, 'Department Head Dashboard retrieved successfully', dashboardData);
  } catch (error) {
    console.error('[getDepartmentHeadDashboard] Error:', error);
    return sendResponse(response, 500, false, 'Server error extracting dashboard metadata');
  }
};
