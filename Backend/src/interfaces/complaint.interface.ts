import { Document, Types } from 'mongoose';

export type ComplaintStatus = 'pending' | 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IComplaint extends Document {
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  
  slaDeadline: Date;
  slaStatus: 'normal' | 'extended';
  slaBreached: boolean;
  assignedAt?: Date;
  lastAssignedAt?: Date;
  reassignmentCount: number;
  resolvedAt?: Date;
  isActive: boolean;
  
  attachedImages: string[];
  
  location?: {
    lat: number;
    lng: number;
  };

  // Ranking & Recommendations
  recommendedStaffIds: Types.ObjectId[];
  
  // Feedback System
  rating?: number;
  feedbackComment?: string;
  feedbackSubmittedAt?: Date;
  resolutionRemarks?: string;
  
  residentId: Types.ObjectId;
  departmentId: Types.ObjectId;
  assignedStaffId?: Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}
