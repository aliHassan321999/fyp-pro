import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/user.interface';

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ['admin', 'department_head', 'staff', 'resident'],
      required: true
    },
    rank: {
      type: String,
      enum: ['junior', 'standard', 'senior'],
      default: 'junior'
    },
    accountStatus: {
      type: String,
      enum: ['active', 'pending', 'suspended'],
      default: 'pending'
    },
    statusHistory: [
      {
        status: { type: String, enum: ['active', 'pending', 'suspended'], required: true },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String }
      }
    ],
    applicationVersion: {
      type: Number,
      default: 1
    },
    rejectionReason: {
      type: String
    },
    lastAppliedAt: {
      type: Date
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: function (this: any) {
        return this.role === 'department_head';
      }
    },
    refreshToken: { type: String },
    profile: {
      cnic: { type: String, required: true, unique: true },
      proofDocumentUrl: { type: String },
      fullName: { type: String, required: function(this: any) { return this.role === 'staff'; } },
      phone: { type: String },
      address: {
        block: String,
        houseNumber: String,
        street: String
      }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
