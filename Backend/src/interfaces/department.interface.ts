import { Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  slaTargetHours: number;
  description?: string;
  headOfDepartment?: Types.ObjectId;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}