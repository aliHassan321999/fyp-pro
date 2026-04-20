import mongoose, { Schema } from 'mongoose';
import { IDepartment } from '../interfaces/department.interface';

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    keywords: { type: [String], default: [] },
    slaTargetHours: { 
      type: Number, 
      required: true 
    },
    description: { type: String },
    headOfDepartment: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
