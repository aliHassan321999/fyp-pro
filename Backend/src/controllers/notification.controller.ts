import { Response } from 'express';
import { Notification } from '../models/notification.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendResponse } from '../utils/response';

export const getNotifications = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return sendResponse(response, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    console.error('[getNotifications] Error:', error);
    return sendResponse(response, 500, false, 'Server error retrieving notifications');
  }
};

export const markAsRead = async (request: AuthenticatedRequest, response: Response): Promise<any> => {
  try {
    const user = request.user!;
    const { id } = request.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendResponse(response, 404, false, 'Notification not found');
    }

    return sendResponse(response, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    console.error('[markAsRead] Error:', error);
    return sendResponse(response, 500, false, 'Server error marking notification as read');
  }
};
