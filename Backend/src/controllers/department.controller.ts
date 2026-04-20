import mongoose from 'mongoose';
import { Response } from 'express';
import { Department } from '../models/department.model';
import { User } from '../models/user.model';
import { Complaint } from '../models/complaint.model';
import { ActivityLog } from '../models/activityLog.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createDepartment = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    let { name, slaTargetHours, description } = request.body;

    name = name?.trim();
    description = description?.trim();

    if (!name || slaTargetHours === undefined) {
      response.status(400).json({ success: false, message: 'Name and SLA Target Hours are strictly required.' });
      return;
    }

    if (name.length > 100) {
      response.status(400).json({ success: false, message: 'Department name cannot exceed 100 characters.' });
      return;
    }
    if (description && description.length > 300) {
      response.status(400).json({ success: false, message: 'Description cannot exceed 300 characters.' });
      return;
    }

    const slaNum = Number(slaTargetHours);
    if (!Number.isFinite(slaNum) || slaNum <= 0 || slaNum > 720) {
      response.status(400).json({ success: false, message: 'SLA must be a valid number between 1 and 720 hours.' });
      return;
    }

    const existingName = await Department.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingName) {
      response.status(400).json({ success: false, message: 'Department already exists' });
      return;
    }

    const newDepartment = await Department.create({
      name,
      slaTargetHours: slaNum,
      description,
      headOfDepartment: null,
      createdBy: request.user?._id
    });

    response.status(201).json({ success: true, data: newDepartment, message: 'Department created successfully.' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Something went wrong' });
  }
};

export const getDepartments = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
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

    response.status(200).json({ success: true, count: departmentsWithStats.length, data: departmentsWithStats });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Something went wrong while fetching departments.' });
  }
};

/**
 * GET /departments/:id
 * Returns a single department with head populated, staff count, and SLA metrics
 * computed from complaint aggregation. Also computes a trend (last 30 vs prev 30 days).
 */
export const getDepartmentById = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;

    const department = await Department.findById(id)
      .populate('headOfDepartment', 'profile.fullName email rank');

    if (!department) {
      response.status(404).json({ success: false, message: 'Department not found.' });
      return;
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
          totalResolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
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

    // Previous period (30-60 days ago) for trend
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

    response.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        staffCount,
        slaMetrics: {
          complianceRate,
          totalResolved: currTotal,
          totalBreached: currBreached,
          avgResolutionHours,
          trend
        }
      }
    });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to fetch department.' });
  }
};

/**
 * GET /departments/:id/staff
 * Returns all staff in this department, each enriched with complaint performance stats.
 */
export const getDepartmentStaff = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;

    const staffList = await User.find({ departmentId: id, role: 'staff' })
      .select('profile.fullName email rank accountStatus createdAt');

    if (staffList.length === 0) {
      response.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const staffIds = staffList.map(s => s._id);
    const now = new Date();

    // Aggregate complaint stats for all staff in one query
    const statsAgg = await Complaint.aggregate([
      { $match: { assignedStaffId: { $in: staffIds } } },
      {
        $group: {
          _id: '$assignedStaffId',
          assignedCount: {
            $sum: {
              $cond: [{ $in: ['$status', ['assigned', 'in_progress']] }, 1, 0]
            }
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

    // Map stats by staff ID for O(1) lookup
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

    response.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to fetch department staff.' });
  }
};

/**
 * PATCH /departments/:id/assign-head
 * Assigns a staff member as the department head.
 * Validates: staff must belong to this department.
 * Rule: one department = one head. Old head is NOT demoted (role unchanged).
 */
export const assignHead = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    const { staffId } = request.body;

    if (!staffId) {
      response.status(400).json({ success: false, message: 'staffId is required.' });
      return;
    }

    const department = await Department.findById(id);
    if (!department) {
      response.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }

    const staff = await User.findById(staffId);
    if (!staff) {
      response.status(404).json({ success: false, message: 'Staff member not found.' });
      return;
    }

    if (staff.role !== 'staff' && staff.role !== 'department_head') {
      response.status(400).json({ success: false, message: 'Only staff or department heads can be assigned as head.' });
      return;
    }

    if (staff.departmentId?.toString() !== id) {
      response.status(400).json({ success: false, message: 'Staff member must belong to this department to become head.' });
      return;
    }

    const previousHeadId = department.headOfDepartment;
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

    response.status(200).json({ success: true, message: `${staff.profile?.fullName || staff.email} has been assigned as department head.` });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to assign department head.' });
  }
};

/**
 * PATCH /departments/:id
 * Updates department name, description, and SLA target hours.
 */
export const updateDepartment = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    let { name, slaTargetHours, description } = request.body;

    name = name?.trim();
    description = description?.trim();

    const department = await Department.findById(id);
    if (!department) {
      response.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }

    if (name && name !== department.name) {
      if (name.length > 100) {
        response.status(400).json({ success: false, message: 'Department name cannot exceed 100 characters.' });
        return;
      }
      const conflict = await Department.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      if (conflict) {
        response.status(400).json({ success: false, message: 'Another department with this name already exists.' });
        return;
      }
      department.name = name;
    }

    if (slaTargetHours !== undefined) {
      const slaNum = Number(slaTargetHours);
      if (!Number.isFinite(slaNum) || slaNum <= 0 || slaNum > 720) {
        response.status(400).json({ success: false, message: 'SLA must be between 1 and 720 hours.' });
        return;
      }
      department.slaTargetHours = slaNum;
    }

    if (description !== undefined) {
      if (description.length > 300) {
        response.status(400).json({ success: false, message: 'Description cannot exceed 300 characters.' });
        return;
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

    response.status(200).json({ success: true, data: department, message: 'Department updated successfully.' });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Failed to update department.' });
  }
};

/**
 * GET /departments/:id/recommend-staff
 * Aggregates workload and SLA parameters explicitly evaluating custom math rules to rank assignment optimally.
 */
export const recommendStaff = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    
    const staffAgg = await User.aggregate([
      // 1. Constraints
      { 
        $match: { 
          departmentId: new mongoose.Types.ObjectId(id), 
          role: 'staff', 
          accountStatus: 'active' 
        } 
      },
      
      // 2. Lookup existing queue
      {
        $lookup: {
          from: 'complaints',
          localField: '_id',
          foreignField: 'assignedStaffId',
          as: 'ticketHistory'
        }
      },
      
      // 3. Extrapolate active vs resolved 
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
      
      // 4. Heavy payload projection truncation
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

      // Workload Non-linear Penalty 
      if (staff.activeComplaints >= 10) {
        score_W = -50; 
      } else {
        score_W = Math.max(0, 40 - (Math.pow(staff.activeComplaints, 1.3) * 3));
      }

      // SLA Penalty neutral bias
      if (staff.resolvedTotal === 0) {
        score_SLA = 25; 
      } else {
        score_SLA = (staff.resolvedOnTime / staff.resolvedTotal) * 40;
      }

      // Availability Matrix
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

    // Multi-factor Array Sorting execution
    rankedStaff.sort((a, b) => {
      if (b.metrics.matchScore !== a.metrics.matchScore) return b.metrics.matchScore - a.metrics.matchScore;
      if (b.metrics.slaComplianceRate !== a.metrics.slaComplianceRate) return b.metrics.slaComplianceRate - a.metrics.slaComplianceRate;
      return a.metrics.activeComplaints - b.metrics.activeComplaints;
    });

    // Rigid slicing preventing oversized arrays
    const topRecommendations = rankedStaff.slice(0, 3);

    response.status(200).json({ success: true, count: topRecommendations.length, data: topRecommendations });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server Exception inside ranking model.' });
  }
};
