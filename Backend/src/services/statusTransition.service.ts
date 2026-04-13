import { ComplaintStatus } from '../interfaces/complaint.interface';

const allowedTransitions: Record<string, string[]> = {
  pending_assignment: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: []
};

/**
 * Validates if the transition from currentStatus to nextStatus is conceptually allowed.
 */
export const isValidTransition = (currentStatus: string, nextStatus: string): boolean => {
  const allowedNext = allowedTransitions[currentStatus] || [];
  return allowedNext.includes(nextStatus);
};

/**
 * Validates if the user has the required role/ownership to perform the transition.
 */
export const canPerformTransition = (
  userRole: string,
  currentStatus: string,
  nextStatus: string,
  isAssignedStaff: boolean,
  isComplaintOwner: boolean
): boolean => {
  if (currentStatus === 'pending_assignment' && nextStatus === 'assigned') {
    return userRole === 'department_head' || userRole === 'admin';
  }

  if (currentStatus === 'assigned' && nextStatus === 'in_progress') {
    return isAssignedStaff;
  }

  if (currentStatus === 'in_progress' && nextStatus === 'resolved') {
    return isAssignedStaff;
  }

  if (currentStatus === 'resolved' && nextStatus === 'closed') {
    return isComplaintOwner;
  }

  return false;
};
