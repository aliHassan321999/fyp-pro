export interface Complaint {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  residentId?: { _id: string; email: string; profile?: { fullName: string } };
  assignedStaffId?: { _id: string; email: string; profile?: { fullName: string } } | string;
  departmentId?: { _id: string; name: string } | any;
  category?: string;
  locationText?: string;
  slaDeadline?: string;
  createdAt: string;
  updatedAt: string;
  feedbackSubmitted?: boolean;
  feedbackRating?: number;
  feedbackComment?: string;
  resolutionRemarks?: string;
  images?: string[];
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
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
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
