import { Response } from 'express';
import { User } from '../models/user.model';
import { Complaint } from '../models/complaint.model';
import { ActivityLog } from '../models/activityLog.model';
import { sendEmail } from '../utils/email';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/response';

/**
 * Executes explicitly dynamic unified Global Analytics natively aggregating full clusters perfectly.
 */
export const getGlobalAnalytics = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { startDate, endDate } = request.query;

    const start = startDate ? new Date(startDate as string) : null;
    const end = endDate ? new Date(endDate as string) : null;

    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    const matchStage: any = {};

    if (!start || !end) {
      const now = new Date();
      const past = new Date();
      past.setDate(now.getDate() - 30);
      matchStage.createdAt = { $gte: past, $lte: now };
    } else {
      matchStage.createdAt = { $gte: start, $lte: end };
    }

    const defaultDateBounds = new Date();

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                totalComplaints: { $sum: 1 },
                resolvedComplaints: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                pendingComplaints: { $sum: { $cond: [{ $ne: ["$status", "resolved"] }, 1, 0] } },
                avgResolutionTimeHours: {
                  $avg: {
                    $cond: [
                      { $eq: ["$status", "resolved"] },
                      { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60] },
                      null
                    ]
                  }
                }
              }
            }
          ],
          slaMetrics: [
            {
              $group: {
                _id: null,
                slaBreachedResolved: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "resolved"] },
                          { $gt: ["$resolvedAt", "$slaDeadline"] }
                        ]
                      }, 1, 0
                    ]
                  }
                },
                slaBreachedPending: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ["$status", "resolved"] },
                          { $lt: ["$slaDeadline", defaultDateBounds] }
                        ]
                      }, 1, 0
                    ]
                  }
                },
                slaExtended: {
                  $sum: {
                    $cond: [{ $eq: ["$slaStatus", "extended"] }, 1, 0]
                  }
                },
                slaOnTimeResolved: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "resolved"] },
                          { $lte: ["$resolvedAt", "$slaDeadline"] }
                        ]
                      }, 1, 0
                    ]
                  }
                }
              }
            }
          ],
          trends: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ],
          departments: [
            {
              $group: {
                _id: "$departmentId",
                totalComplaints: { $sum: 1 },
                resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                slaBreached: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $and: [{ $eq: ["$status", "resolved"] }, { $gt: ["$resolvedAt", "$slaDeadline"] }] },
                          { $and: [{ $ne: ["$status", "resolved"] }, { $lt: ["$slaDeadline", defaultDateBounds] }] }
                        ]
                      }, 1, 0
                    ]
                  }
                },
                slaOnTimeResolved: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ["$status", "resolved"] }, { $lte: ["$resolvedAt", "$slaDeadline"] }] }, 1, 0
                    ]
                  }
                },
                avgResolutionTimeHours: {
                  $avg: {
                    $cond: [
                      { $eq: ["$status", "resolved"] },
                      { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60] },
                      null
                    ]
                  }
                }
              }
            },
            {
              $lookup: {
                from: "departments",
                localField: "_id",
                foreignField: "_id",
                as: "department"
              }
            },
            {
              $project: {
                departmentName: { $arrayElemAt: ["$department.name", 0] },
                totalComplaints: 1,
                resolved: 1,
                slaBreached: 1,
                avgResolutionTimeHours: { $round: ["$avgResolutionTimeHours", 1] },
                complianceRate: {
                  $cond: [
                    { $eq: ["$resolved", 0] },
                    0,
                    { $round: [{ $multiply: [{ $divide: ["$slaOnTimeResolved", "$resolved"] }, 100] }, 1] }
                  ]
                }
              }
            }
          ],
          staff: [
            { $match: { assignedStaffId: { $ne: null } } },
            {
              $group: {
                _id: "$assignedStaffId",
                assignedCount: { $sum: 1 },
                resolvedCount: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                slaBreaches: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          { $and: [{ $eq: ["$status", "resolved"] }, { $gt: ["$resolvedAt", "$slaDeadline"] }] },
                          { $and: [{ $ne: ["$status", "resolved"] }, { $lt: ["$slaDeadline", defaultDateBounds] }] }
                        ]
                      }, 1, 0
                    ]
                  }
                },
                slaOnTimeResolved: {
                  $sum: {
                    $cond: [
                      { $and: [{ $eq: ["$status", "resolved"] }, { $lte: ["$resolvedAt", "$slaDeadline"] }] }, 1, 0
                    ]
                  }
                },
                avgResolutionTimeHours: {
                  $avg: {
                    $cond: [
                      { $eq: ["$status", "resolved"] },
                      { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 1000 * 60 * 60] },
                      null
                    ]
                  }
                }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "staffUser"
              }
            },
            {
              $project: {
                staffName: { $arrayElemAt: ["$staffUser.profile.fullName", 0] },
                assignedCount: 1,
                resolvedCount: 1,
                slaBreaches: 1,
                avgResolutionTimeHours: { $round: ["$avgResolutionTimeHours", 1] },
                complianceRate: {
                  $cond: [
                    { $eq: ["$resolvedCount", 0] },
                    0,
                    { $round: [{ $multiply: [{ $divide: ["$slaOnTimeResolved", "$resolvedCount"] }, 100] }, 1] }
                  ]
                }
              }
            }
          ]
        }
      }
    ];

    const result = await Complaint.aggregate(pipeline);
    const resolvedPayload = result[0];

    const safeOverview = resolvedPayload.overview[0] || {
      totalComplaints: 0,
      resolvedComplaints: 0,
      pendingComplaints: 0,
      avgResolutionTimeHours: 0
    };

    safeOverview.avgResolutionTimeHours = Number(safeOverview.avgResolutionTimeHours?.toFixed(1) || 0);

    const safeSla = resolvedPayload.slaMetrics[0] || {
      slaBreachedResolved: 0,
      slaBreachedPending: 0,
      slaExtended: 0,
      slaOnTimeResolved: 0
    };

    const slaComplianceRate = safeOverview.resolvedComplaints > 0 
      ? Number(((safeSla.slaOnTimeResolved / safeOverview.resolvedComplaints) * 100).toFixed(1)) 
      : 0;

    return sendResponse(response, 200, true, 'Global analytics retrieved', {
        overview: safeOverview,
        slaMetrics: { ...safeSla, slaComplianceRate },
        trends: resolvedPayload.trends || [],
        departments: resolvedPayload.departments || [],
        staff: resolvedPayload.staff || []
    });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error explicitly executing Analytics Core');
  }
};

/**
 * Retrieves all users securely trapped in the pending approval queue.
 */
export const getPendingUsers = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const pendingUsers = await User.find({ accountStatus: 'pending', role: 'resident' })
      .select('-password -refreshToken') // Heavily strict DB stripping
      .sort({ createdAt: -1 });

    const approvedCount = await User.countDocuments({ accountStatus: 'active', role: 'resident' });
    const rejectedCount = await User.countDocuments({ accountStatus: 'suspended', role: 'resident' });

    return sendResponse(response, 200, true, 'Pending users retrieved', {
      pendingUsers,
      approvedCount,
      rejectedCount
    });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Executes a hard approval explicitly switching status and notifying the user.
 */
export const approveUser = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const user = await User.findById(id);

    if (!user) {
      return sendResponse(response, 404, false, 'User not found in registry');
    }

    if (user.accountStatus !== 'pending') {
      return sendResponse(response, 400, false, 'Only heavily locked pending users can be approved');
    }

    user.accountStatus = 'active';
    user.approvedBy = request.user?._id;
    user.statusHistory.push({ status: 'active', changedAt: new Date() });
    await user.save();

    // Trigger explicit administrative audit logging dynamically
    await ActivityLog.create({
      action: 'user_approved',
      performedBy: request.user?._id,
      targetUser: user._id,
      oldValue: 'pending',
      newValue: 'active'
    });

    // Fire explicit Welcome Email
    try {
      await sendEmail({
        to: user.email,
        subject: "Your Account Has Been Approved 🎉",
        message: `Welcome to the community! 👋
        
Great news! 🎉

Your account has been officially approved by our administration team. You now have full, unrestricted access to the Complaint Management System!

You can immediately log in to your dashboard to submit new complaints, track ongoing resolutions natively in real time, and communicate directly with staff.

We are incredibly excited to have you onboard. If you ever need assistance navigating the portal, our support team is always just a click away.

Warm regards,
The Complaint Management Team`
      });
    } catch (emailErr) {
      console.error("[Mail Error]:", emailErr);
    }

    return sendResponse(response, 200, true, 'User has been officially approved and activated.');
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Executes a firm rejection keeping the footprint heavily logged but stripping access via 'suspended'.
 */
export const rejectUser = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const { reason } = request.body;

    const user = await User.findById(id);

    if (!user) {
      return sendResponse(response, 404, false, 'User not found in registry');
    }

    if (user.accountStatus !== 'pending') {
      return sendResponse(response, 400, false, 'Only heavily locked pending users can be formally rejected');
    }

    user.accountStatus = 'suspended';
    user.rejectionReason = reason;
    user.rejectedBy = request.user?._id;
    user.statusHistory.push({ status: 'suspended', changedAt: new Date(), reason });
    await user.save();

    // Trigger explicit structural audit tracking strictly documenting dynamic rejection
    await ActivityLog.create({
      action: 'user_rejected',
      performedBy: request.user?._id,
      targetUser: user._id,
      oldValue: 'pending',
      newValue: reason ? `suspended: ${reason}` : 'suspended'
    });

    // Fire polite Rejection Email with Context
    try {
      await sendEmail({
        to: user.email,
        subject: "Update Regarding Your Registration Application",
        message: `Hello ${user.profile?.fullName || 'Resident'},
        
Thank you for reaching out and registering with the Complaint Management System.

Our administration team has reviewed your application carefully. Unfortunately, we are unable to approve your account access at this specific time.

${reason ? `Reason for Rejection: ${reason}\n\n` : ''}If you believe this was a mistake or you have updated documentation, you are welcome to attempt registration again using this same email address perfectly.

Thank you for your understanding.

Best regards,
The Administration Team`
      });
    } catch (emailErr) {
      console.error("[Mail Error]:", emailErr);
    }

    return sendResponse(response, 200, true, 'User has been officially rejected and suspended.');
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Retrieves all audit logs with pagination, filtering, and sorting capabilities
 */
export const getAuditLogs = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    console.log('🔍🔍🔍 [AUDIT LOGS] API CALLED! User:', request.user?.email);
    const { page = 1, limit = 20, action, userId, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = request.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    console.log('🔍 [Audit Logs] Fetching logs with params:', { page: pageNum, limit: limitNum, action, userId, sortBy, sortOrder });

    // Build filter object
    const filter: any = {};

    if (action) {
      filter.action = new RegExp(action as string, 'i');
    }

    if (userId) {
      filter.performedBy = userId;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    console.log('📋 [Audit Logs] Filter object:', filter);

    // Build sort object
    const sortObj: any = {};
    const sortByStr = (sortBy as string) || 'createdAt';
    const sortOrderNum = (sortOrder as string) === 'asc' ? 1 : -1;
    sortObj[sortByStr] = sortOrderNum;

    // Count total FIRST
    const total = await ActivityLog.countDocuments(filter);
    console.log('📊 [Audit Logs] Total count BEFORE find:', total);

    // Fetch audit logs with pagination
    const logs = await ActivityLog.find(filter)
      .populate('performedBy', 'email profile')
      .populate('targetUser', 'email profile')
      .populate('complaintId', '_id title')
      .populate('departmentId', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log('✅ [Audit Logs] Found logs:', logs.length);

    // Get total count for pagination
    const totalCount = await ActivityLog.countDocuments(filter);
    console.log('📊 [Audit Logs] Total count:', totalCount);

    return sendResponse(response, 200, true, 'Audit logs retrieved successfully', {
      logs,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
      }
    });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * TEST ENDPOINT: Check ActivityLog collection
 */
export const testActivityLogs = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    console.log('🧪 [TEST] ActivityLog endpoint called!');
    
    const count = await ActivityLog.countDocuments({});
    console.log('📊 [TEST] Total ActivityLog documents:', count);
    
    const allLogs = await ActivityLog.find({}).limit(5).lean();
    console.log('📋 [TEST] Sample logs:', JSON.stringify(allLogs, null, 2));
    
    return sendResponse(response, 200, true, 'Test result', { count, sample: allLogs });
  } catch (error) {
    const err = error as Error;
    console.error('❌ [TEST] Error:', err);
    return sendResponse(response, 500, false, err.message || 'Test error');
  }
};
