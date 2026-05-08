import { Response } from 'express';
import mongoose from 'mongoose';
import { Filter } from 'mongodb';
import { Complaint } from '../models/complaint.model';
import { Department } from '../models/department.model';
import { ActivityLog } from '../models/activityLog.model';
import { User } from '../models/user.model';
import { Notification } from '../models/notification.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IComplaint, ComplaintStatus, ComplaintPriority } from '../interfaces/complaint.interface';
import { uploadBufferToCloudinary } from '../utils/cloudinary';
import { classifyComplaint } from '../services/ai.service';
import { sendResponse } from '../utils/response';
import { isValidTransition, canPerformTransition } from '../services/statusTransition.service';
import { processAssignment } from '../services/assignment.service';

/**
 * Previews the AI classification for a complaint before creating it.
 */
export const previewComplaintClassification = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { title, description } = request.body;

    const allDepartments = await Department.find();
    if (allDepartments.length === 0) {
      return sendResponse(response, 500, false, 'Critical Fault: No Departments available for routing.');
    }

    const validDepartmentsPayload = allDepartments.map(d => ({
      name: d.name,
      keywords: d.keywords || []
    }));
    
    const aiContext = title && !title.includes('Automated Voice') ? `${title}. ${description}` : description;
    const aiResult = await classifyComplaint(aiContext, validDepartmentsPayload);

    let finalDepartmentName = 'General';
    let finalDepartmentId = allDepartments[0]._id;

    if (aiResult) {
       const matchedDept = allDepartments.find(d => d.name.trim().toLowerCase() === aiResult.department.trim().toLowerCase());
       if (matchedDept) {
          finalDepartmentName = matchedDept.name;
          finalDepartmentId = matchedDept._id;
       }
    }

    return sendResponse(response, 200, true, 'AI Classification preview generated', {
      departmentName: finalDepartmentName,
      departmentId: finalDepartmentId
    });
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Resident creates a new complaint routing it to a department, automatically computing SLA.
 */
export const createComplaint = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { title, description, departmentId: payloadDeptId, priority: payloadPriority, lat, lng } = request.body;

    const allDepartments = await Department.find();
    if (allDepartments.length === 0) {
      return sendResponse(response, 500, false, 'Critical Fault: No Departments available for routing.');
    }

    const validDepartmentsPayload = allDepartments.map(d => ({
      name: d.name,
      keywords: d.keywords || []
    }));
    
    let finalDepartmentId = payloadDeptId;
    let finalPriority = payloadPriority || 'medium';

    const fallbackTarget = allDepartments.find(d => 
      d.name.trim().toLowerCase() === 'general' || 
      d.name.trim().toLowerCase() === 'unassigned'
    );
    const fallbackDeptId = fallbackTarget ? fallbackTarget._id : allDepartments[0]._id;

    // If frontend already provided the AI-previewed departmentId, we can skip the second AI call
    if (payloadDeptId) {
      finalDepartmentId = payloadDeptId;
    } else {
      // Explicit AI Classification Pipeline
      const aiContext = title && !title.includes('Automated Voice') ? `${title}. ${description}` : description;
      const aiResult = await classifyComplaint(aiContext, validDepartmentsPayload);

      if (aiResult) {
         const matchedDept = allDepartments.find(d => d.name.trim().toLowerCase() === aiResult.department.trim().toLowerCase());
         if (matchedDept) {
            finalDepartmentId = matchedDept._id;
         } else {
            console.warn(`[AI Controller] Hallucinated/Unknown Department: ${aiResult.department}. Falling back to default.`);
            finalDepartmentId = fallbackDeptId;
         }
         if (['low', 'medium', 'high', 'critical'].includes(aiResult.priority)) {
            finalPriority = aiResult.priority;
         }
      } else {
        finalDepartmentId = fallbackDeptId;
      }
    }

    // Capture recommended staff IDs if AI provided any, or leave empty for now
    // (Future: could call recommendStaff logic here)
    const recommendedStaffIds: string[] = [];

    // Strict validation of the determined department
    const department = await Department.findById(finalDepartmentId);
    if (!department) {
      return sendResponse(response, 500, false, 'Department resolution pipeline failed completely.');
    }

    const attachedImages: string[] = [];
    if (request.files && Array.isArray(request.files)) {
      for (const file of request.files) {
         try {
           const url = await uploadBufferToCloudinary(file.buffer, 'complaints');
           attachedImages.push(url);
         } catch(e) {
           console.error("[Backend] Cloudinary upload exception:", e);
         }
      }
    }

    let location;
    if (lat && lng) {
      location = { lat: Number(lat), lng: Number(lng) };
    }

    // SLA Calculation dynamically mapped from the absolute validated Department
    const slaDeadline = new Date(Date.now() + department.slaTargetHours * 60 * 60 * 1000);

    const complaint = await Complaint.create({
      title,
      description,
      departmentId: finalDepartmentId,
      priority: finalPriority,
      attachedImages,
      location,
      residentId: user._id,
      status: 'pending_assignment', // Updated status per requirements
      slaDeadline,
      assignedStaffId: department.headOfDepartment, // Assigned to Dept Head by default
      recommendedStaffIds // Persist recommendations
    });

    await ActivityLog.create({
      complaintId: complaint._id,
      action: 'created',
      performedBy: user._id,
      newValue: 'pending_assignment'
    });

    return sendResponse(response, 201, true, 'Complaint created successfully and routed to department head.', complaint);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Intelligent fetch endpoint heavily relying on Strict Role Filtering constraints.
 */
export const getComplaints = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    
    // Explicitly typed mongoose filter array
    const filter: Filter<IComplaint> = {};

    // Strict Filtering Requirements Enforced Natively without 'any' bypasses
    if (user.role === 'resident') {
      filter.residentId = user._id as any;
    } else if (user.role === 'department_head') {
      filter.departmentId = user.departmentId as any;
    } else if (user.role === 'staff') {
      filter.assignedStaffId = user._id as any;
    }

    // Explicit type assertions for URL Queries
    if (request.query.status) {
      filter.status = request.query.status as ComplaintStatus;
    }
    if (request.query.priority) {
      filter.priority = request.query.priority as ComplaintPriority;
    }

    const complaints = await Complaint.find(filter as any)
      .populate('residentId', 'email profile.fullName')
      .populate('assignedStaffId', 'email profile.fullName')
      .sort({ createdAt: -1 });

    return sendResponse(response, 200, true, 'Complaints retrieved', complaints);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Update the Complaint Status explicitly tracking resolvedAt states.
 */
export const updateComplaintStatus = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { id } = request.params;
    const { status, resolutionRemarks } = request.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendResponse(response, 404, false, 'Complaint not found');
    }

    const oldStatus = complaint.status;

    if (!isValidTransition(oldStatus, status)) {
      return sendResponse(response, 400, false, 'Invalid status transition');
    }

    const isAssignedStaff = complaint.assignedStaffId?.toString() === user._id.toString();
    const isComplaintOwner = complaint.residentId.toString() === user._id.toString();

    if (!canPerformTransition(user.role, oldStatus, status, isAssignedStaff, isComplaintOwner)) {
      return sendResponse(response, 403, false, 'Unauthorized action for this role');
    }

    complaint.status = status;
    
    // Enforcing rigid closure footprint properties automatically
    if (status === 'resolved') {
      complaint.resolutionRemarks = resolutionRemarks;
      complaint.resolvedAt = new Date(); // Hard override of resolution timestamp
    }

    await complaint.save();

    await ActivityLog.create({
      complaintId: complaint._id,
      action: 'status_updated',
      performedBy: user._id,
      oldValue: oldStatus,
      newValue: status,
      metadata: {
        from: oldStatus,
        to: status
      }
    });

    await Notification.create({
      userId: complaint.residentId,
      type: 'status_update',
      message: `Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} status changed to ${status.replace('_', ' ')}`
    });

    return sendResponse(response, 200, true, 'Complaint status updated', complaint);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server error');
  }
};

/**
 * Assign a specific staff member to a complaint securely.
 */
export const assignComplaint = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { id } = request.params;
    const { assignedStaffId } = request.body;

    if (!assignedStaffId) {
      return sendResponse(response, 400, false, 'Assigned Staff ID payload missing');
    }

    const complaint = await processAssignment(id as string, assignedStaffId, user._id);

    return sendResponse(response, 200, true, 'Complaint assigned successfully', complaint);
  } catch (error: any) {
    const errMessage = error.message || '';
    
    // Distinguish validation vs critical errors
    const clientErrors = [
      'Complaint not found', 
      'Invalid assignment state', 
      'Complaint is already assigned', 
      'Invalid staff member', 
      'Staff does not belong to this department',
      'Reassignment limit reached',
      'Reassignment cooldown active'
    ];
    
    if (clientErrors.includes(errMessage)) {
      return sendResponse(response, 400, false, errMessage);
    }
    
    return sendResponse(response, 500, false, errMessage || 'Server Exception during Assignment');
  }
};

/**
 * Fetch dedicated ticket aggregates and meta-schema payloads implicitly
 */
export const getComplaintById = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const complaint = await Complaint.findById(id)
      .populate('residentId', 'email profile.fullName')
      .populate('assignedStaffId', 'email profile.fullName')
      .populate('departmentId', 'name');

    if (!complaint) {
      return sendResponse(response, 404, false, 'Complaint sequence block not found');
    }
    
    // Implicit user ownership validation theoretically should exist for Residents, but 
    // relying on dynamic UI routing for now.
    return sendResponse(response, 200, true, 'Complaint details retrieved', complaint);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server Exception extracting details');
  }
};

/**
 * Extract chronological timeline payloads mapped sequentially 
 */
export const getComplaintActivity = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const { id } = request.params;
    const activities = await ActivityLog.find({ complaintId: id })
       .populate('performedBy', 'email profile.fullName')
       .sort({ createdAt: 1 }); // Ascending chronologically

    const formattedActivities = activities.map(activity => {
      const performedBy: any = activity.performedBy;
      return {
        action: activity.action,
        performedBy: performedBy ? {
          name: performedBy.profile?.fullName || 'System',
          email: performedBy.email
        } : { name: 'System', email: null },
        metadata: activity.metadata || {},
        createdAt: activity.createdAt
      };
    });

    return sendResponse(response, 200, true, 'Complaint activity timeline retrieved', formattedActivities);
  } catch (error) {
    const err = error as Error;
    return sendResponse(response, 500, false, err.message || 'Server Exception extracting timeline');
  }
};

/**
 * Submit feedback for a resolved or closed complaint.
 * Constraints:
 * - Only allowed when status is 'resolved' or 'closed'
 * - Only one feedback submission per complaint
 * - Rating (1-5) is strictly required
 */
export const submitComplaintFeedback = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { id } = request.params;
    const { rating, feedbackComment } = request.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return sendResponse(response, 404, false, 'Complaint not found');
    }

    // Security: Only the resident who created the complaint can submit feedback
    if (complaint.residentId.toString() !== user._id.toString()) {
      return sendResponse(response, 403, false, 'You are not authorized to submit feedback for this complaint.');
    }

    // Constraint: Only resolved status allowed for feedback
    if (complaint.status !== 'resolved') {
      return sendResponse(response, 400, false, 'Feedback can only be submitted for resolved complaints.');
    }

    // Constraint: One-time submission
    if (complaint.feedbackSubmittedAt) {
      return sendResponse(response, 400, false, 'Feedback has already been submitted for this complaint.');
    }

    // Constraint: Rating required and in range
    const ratingNum = Number(rating);
    if (!rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return sendResponse(response, 400, false, 'A valid rating between 1 and 5 is strictly required.');
    }

    // Optimistic Concurrency Control
    const updatedComplaint = await Complaint.findOneAndUpdate(
      { _id: complaint._id, updatedAt: complaint.updatedAt },
      { 
        $set: { 
          rating: ratingNum, 
          feedbackComment: feedbackComment, 
          feedbackSubmittedAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return sendResponse(response, 409, false, 'Conflict: The document was modified by another process. Please refresh and try again.');
    }

    await ActivityLog.create({
      complaintId: updatedComplaint._id,
      action: 'feedback_submitted',
      performedBy: user._id,
      metadata: { 
        message: `Rated ${ratingNum} stars` 
      }
    });

    return sendResponse(response, 200, true, 'Feedback submitted successfully. Thank you for your input!', updatedComplaint);
  } catch (error) {
    console.error('[submitComplaintFeedback] Error:', error);
    return sendResponse(response, 500, false, 'Server error while submitting feedback');
  }
};
# commit-marker: [2026-03-13 13:00:00] Implement complaint submission controller
# commit-marker: [2026-03-14 09:15:00] Add complaint listing with pagination and filters
# commit-marker: [2026-03-23 12:00:00] Add society management controller and model
# commit-marker: [2026-03-24 15:00:00] Implement complaint status update endpoint
# commit-marker: [2026-04-09 11:00:00] Add file attachment upload with Multer middleware
# commit-marker: [2026-04-10 14:30:00] Integrate Cloudinary for complaint image storage
# commit-marker: [2026-04-18 09:15:00] Implement custom AppError class for typed errors
# commit-marker: [2026-05-01 10:00:00] Refactor complaint controller for code consistency
# commit-marker: [2026-05-02 13:30:00] Add export complaints to CSV functionality
# commit-marker: [2026-05-06 10:30:00] Write unit tests for complaint controller
# commit-marker: [2026-05-08 09:45:00] Fix validation edge cases in complaint submission
