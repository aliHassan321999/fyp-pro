export interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  residentId?: { _id: string; email: string; profile?: { fullName: string } };
  assignedStaffId?: { _id: string; email: string; profile?: { fullName: string } } | string;
  departmentId?: { _id: string; name: string } | any;
  category?: string;
  location?: { lat: number; lng: number };
  locationText?: string;
  slaDeadline: string;
  slaStatus?: 'normal' | 'extended';
  slaBreached?: boolean;
  assignedAt?: string;
  lastAssignedAt?: string;
  resolvedAt?: string;
  reassignmentCount?: number;
  createdAt: string;
  updatedAt: string;
  feedbackSubmitted?: boolean;
  rating?: number;
  feedbackComment?: string;
  resolutionRemarks?: string;
  attachedImages?: string[];
  images?: string[];
  isActive?: boolean;
  recommendedStaffIds?: string[];
}

export interface SubmitFeedbackDto {
  id: string;
  rating: number;
  comment?: string;
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  departmentId?: string;
  locationText?: string;
}

export interface UpdateComplaintStatusDto {
  id: string;
  status: 'pending' | 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  resolutionRemarks?: string;
}

export interface AssignComplaintDto {
  id: string;
  assignedStaffId: string;
}

export interface StaffMember {
  _id: string;
  name: string;
  departmentId?: string;
}

export interface GetStaffResponse {
  success: boolean;
  count: number;
  data: StaffMember[];
}

export interface ComplaintResponse {
  success: boolean;
  message?: string;
  data: Complaint;
}

export interface GetComplaintsResponse {
  success: boolean;
  data: Complaint[];
  total: number;
}

export interface ActivityLogNode {
  action: string;
  performedBy: { name: string; email: string | null };
  metadata: {
    from?: string;
    to?: string;
    assignedTo?: string;
    message?: string;
  };
  createdAt: string;
}

export interface GetComplaintActivityResponse {
  success: boolean;
  count: number;
  data: ActivityLogNode[];
}
