import mongoose, { Schema } from 'mongoose';
import { IComplaint } from '../interfaces/complaint.interface';

const complaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'pending' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium' 
    },
    
    slaDeadline: { type: Date, required: true },
    slaStatus: { type: String, enum: ['normal', 'extended'], default: 'normal' },
    assignedAt: { type: Date },
    resolvedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    
    attachedImages: [{ type: String }],
    
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Formal structural indexing for temporal Dashboard Aggregation bounding
complaintSchema.index({ createdAt: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
