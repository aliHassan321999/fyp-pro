import { Document, Types } from 'mongoose';

export interface IAddress {
  block: string;
  houseNumber: string;
  floor?: number;
}

export interface IUserProfile {
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  cnic: string;
  proofDocumentUrl?: string;
  profileImage?: string;
  address?: IAddress;
}

export type UserRole = 'admin' | 'department_head' | 'staff' | 'resident';

export interface IStatusHistory {
  status: 'active' | 'pending' | 'suspended';
  changedAt: Date;
  reason?: string;
}

export interface IUser extends Document {
  email: string;
  password?: string;
  role: UserRole;
  rank?: 'junior' | 'standard' | 'senior';
  accountStatus: 'active' | 'pending' | 'suspended';
  statusHistory: IStatusHistory[];
  applicationVersion: number;
  rejectionReason?: string;
  lastAppliedAt?: Date;
  approvedBy?: Types.ObjectId | string;
  rejectedBy?: Types.ObjectId | string;
  profile: IUserProfile;
  departmentId?: Types.ObjectId | string; // Only used if the user is 'staff'
  lastLogin?: Date;
  socketId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}