import mongoose, { Schema } from 'mongoose';
import { IActivityLog } from '../interfaces/activityLog.interface';

const activityLogSchema = new Schema<IActivityLog>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: 'Complaint'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department'
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    oldValue: {
      type: String
    },
    newValue: {
      type: String
    },
    meta: {
      type: Schema.Types.Mixed
    },
    metadata: {
      from: { type: String },
      to: { type: String },
      assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
      message: { type: String }
    }
  },
  { timestamps: true }
);

activityLogSchema.index({ complaintId: 1 });
activityLogSchema.index({ complaintId: 1, createdAt: 1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
