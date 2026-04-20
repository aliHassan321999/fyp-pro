import { Document, Types } from 'mongoose';

export type ComplaintStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';

export interface IComplaint extends Document {
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  
  slaDeadline: Date;
  slaStatus: 'normal' | 'extended';
  assignedAt?: Date;
  resolvedAt?: Date;
  isActive: boolean;
  
  attachedImages: string[];
  
  location?: {
    lat: number;
    lng: number;
  };
  
  residentId: Types.ObjectId;
  departmentId: Types.ObjectId;
  assignedStaffId?: Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}
