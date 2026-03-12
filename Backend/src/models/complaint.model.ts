import mongoose, { Schema } from 'mongoose';
import { IComplaint } from '../interfaces/complaint.interface';

const complaintSchema = new Schema<IComplaint>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'pending_assignment', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'pending_assignment' 
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium' 
    },
    
    slaDeadline: { type: Date, required: true },
    slaStatus: { type: String, enum: ['normal', 'extended'], default: 'normal' },
    slaBreached: { type: Boolean, default: false },
    assignedAt: { type: Date },
    lastAssignedAt: { type: Date },
    reassignmentCount: { type: Number, default: 0 },
    resolvedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    
    attachedImages: [{ type: String }],
    
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },

    // Ranking & Persistence
    recommendedStaffIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    // Feedback System
    rating: { type: Number, min: 1, max: 5 },
    feedbackComment: { type: String },
    feedbackSubmittedAt: { type: Date },
    resolutionRemarks: { type: String },
    
    residentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    assignedStaffId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Formal structural indexing for performance optimization
complaintSchema.index({ createdAt: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ departmentId: 1 });
complaintSchema.index({ assignedStaffId: 1 });
complaintSchema.index({ departmentId: 1, status: 1 });
complaintSchema.index({ assignedStaffId: 1, status: 1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
# commit-marker: [2026-03-12 10:30:00] Create Complaint model with status and category fields
