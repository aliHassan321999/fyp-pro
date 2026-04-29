import { Document, Types } from 'mongoose';

export type NotificationType = 'assignment' | 'sla_breach' | 'status_update';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
