import { Document, Types } from 'mongoose';

export interface IActivityLog extends Document {
  complaintId?: Types.ObjectId;
  departmentId?: Types.ObjectId;
  targetUser?: Types.ObjectId;
  action: string;
  performedBy: Types.ObjectId;
  oldValue?: string;
  newValue?: string;
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}

