import { Response } from 'express';
import { Department } from '../models/department.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createDepartment = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  try {
    let { name, slaTargetHours, description } = request.body;

    // Normalization
    name = name?.trim();
    description = description?.trim();

    // Field presence
    if (!name || slaTargetHours === undefined) {
      response.status(400).json({ success: false, message: 'Name and SLA Target Hours are strictly required.' });
      return;
    }

    // Length validation
    if (name.length > 100) {
      response.status(400).json({ success: false, message: 'Department name cannot exceed 100 characters.' });
      return;
    }
    if (description && description.length > 300) {
      response.status(400).json({ success: false, message: 'Description cannot exceed 300 characters.' });
      return;
    }

    // SLA Validation
    const slaNum = Number(slaTargetHours);
    if (!Number.isFinite(slaNum) || slaNum <= 0 || slaNum > 720) {
      response.status(400).json({ success: false, message: 'SLA must be a valid number between 1 and 720 hours.' });
      return;
    }

    // Case-insensitive uniqueness check
    const existingName = await Department.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingName) {
      response.status(400).json({ success: false, message: 'Department already exists' });
      return;
    }

    const newDepartment = await Department.create({
      name, // Store original trimmed value
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
     // Return all departments to allow admin to filter by Active/Archived on frontend
     const departments = await Department.find()
      .populate('headOfDepartment', 'profile.fullName email')
      .sort({ createdAt: -1 });
     
     // Calculate staff count for each department
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
