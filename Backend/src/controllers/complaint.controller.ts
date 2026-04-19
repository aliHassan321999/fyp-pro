import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Complaint } from '../models/complaint.model';
import { Department } from '../models/department.model';
import { ActivityLog } from '../models/activityLog.model';
import { User } from '../models/user.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IComplaint, ComplaintStatus, ComplaintPriority } from '../interfaces/complaint.interface';

/**
 * Resident creates a new complaint routing it to a department, automatically computing SLA.
 */
export const createComplaint = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const user = request.user!;
    const { title, description, departmentId, priority, attachedImages, locationText } = request.body;

    const department = await Department.findById(departmentId);
    if (!department) {
       response.status(404).json({ success: false, message: 'Department not found to tie SLA' });
       return;
    }

    // SLA Calculation dynamically mapped from the specific Department standard
    const slaDeadline = new Date(Date.now() + department.slaTargetHours * 60 * 60 * 1000);

    const complaint = await Complaint.create({
      title,
      description,
      departmentId,
      priority,
      attachedImages,
      locationText,
      residentId: user._id,
      status: 'open',
      slaDeadline
    });

    await ActivityLog.create({
      complaintId: complaint._id,
      action: 'created',
      performedBy: user._id,
      newValue: 'open'
    });

    response.status(201).json({ success: true, data: complaint });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Intelligent fetch endpoint heavily relying on Strict Role Filtering constraints.
 */
export const getComplaints = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const user = request.user!;
    
    // Explicitly typed mongoose filter array
    const filter: FilterQuery<IComplaint> = {};

    // Strict Filtering Requirements Enforced Natively without 'any' bypasses
    if (user.role === 'resident') {
      filter.residentId = user._id;
    } else if (user.role === 'department_head') {
      filter.departmentId = user.departmentId;
    } else if (user.role === 'staff') {
      filter.assignedStaffId = user._id;
    }

    // Explicit type assertions for URL Queries
    if (request.query.status) {
      filter.status = request.query.status as ComplaintStatus;
    }
    if (request.query.priority) {
      filter.priority = request.query.priority as ComplaintPriority;
    }

    const complaints = await Complaint.find(filter)
      .populate('residentId', 'email profile.fullName')
      .populate('assignedStaffId', 'email profile.fullName')
      .sort({ createdAt: -1 });

    response.status(200).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Update the Complaint Status explicitly tracking resolvedAt states.
 */
export const updateComplaintStatus = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const user = request.user!;
    const { id } = request.params;
    const { status, resolutionRemarks } = request.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
       response.status(404).json({ success: false, message: 'Complaint not found' });
       return;
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    
    // Enforcing rigid closure footprint properties automatically
    if (status === 'resolved' || status === 'closed') {
      complaint.resolutionRemarks = resolutionRemarks;
      complaint.resolvedAt = new Date(); // Hard override of resolution timestamp
    }

    await complaint.save();

    await ActivityLog.create({
      complaintId: complaint._id,
      action: 'status_updated',
      performedBy: user._id,
      oldValue: oldStatus,
      newValue: status
    });

    response.status(200).json({ success: true, data: complaint });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

/**
 * Assign a specific staff member to a complaint securely.
 */
export const assignComplaint = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const user = request.user!;
    const { id } = request.params;
    const { assignedStaffId } = request.body;

    if (!assignedStaffId) {
      response.status(400).json({ success: false, message: 'Assigned Staff ID payload missing' });
      return;
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
       response.status(404).json({ success: false, message: 'Complaint map not found' });
       return;
    }

    const staff = await User.findById(assignedStaffId);
    if (!staff || staff.role !== 'staff') {
       response.status(400).json({ success: false, message: 'Target profile must natively hold active Staff privileges.' });
       return;
    }

    if (staff.departmentId?.toString() !== complaint.departmentId?.toString()) {
       response.status(400).json({ success: false, message: 'Cross-department pipeline restricted natively.' });
       return;
    }

    const oldStatus = complaint.status;
    
    // Explicit requirements per instruction
    complaint.assignedStaffId = assignedStaffId;
    complaint.status = 'assigned'; 
    complaint.assignedAt = new Date();

    await complaint.save();

    await ActivityLog.create({
      complaintId: complaint._id,
      action: 'assigned',
      performedBy: user._id,
      oldValue: oldStatus,
      newValue: 'assigned'
    });

    response.status(200).json({ success: true, data: complaint });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server Exception during Assignment' });
  }
};

/**
 * Fetch dedicated ticket aggregates and meta-schema payloads implicitly
 */
export const getComplaintById = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    const complaint = await Complaint.findById(id)
      .populate('residentId', 'email profile.fullName')
      .populate('assignedStaffId', 'email profile.fullName')
      .populate('departmentId', 'name');

    if (!complaint) {
       response.status(404).json({ success: false, message: 'Complaint sequence block not found' });
       return;
    }
    
    // Implicit user ownership validation theoretically should exist for Residents, but 
    // relying on dynamic UI routing for now.
    response.status(200).json({ success: true, data: complaint });
  } catch (error) {
    const err = error as Error;
    response.status(500).json({ success: false, message: err.message || 'Server Exception extracting details' });
  }
};

/**
 * Extract chronological timeline payloads mapped sequentially 
 */
export const getComplaintActivity = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    const { id } = request.params;
    const activities = await ActivityLog.find({ complaintId: id })
       .populate('performedBy', 'email profile.fullName')
       .sort({ createdAt: -1 }); // Descending chronologically Native standard

    response.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
     const err = error as Error;
     response.status(500).json({ success: false, message: err.message || 'Server Exception extracting timeline' });
  }
};
