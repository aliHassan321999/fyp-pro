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
  data: Complaint;
}

export interface GetComplaintsResponse {
  success: boolean;
  data: Complaint[];
  total: number;
}

export interface ActivityLogNode {
  _id: string;
  complaintId: string;
  action: 'created' | 'assigned' | 'status_updated' | string;
  performedBy: { _id: string; email: string; profile?: { fullName: string } };
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface GetComplaintActivityResponse {
  success: boolean;
  count: number;
  data: ActivityLogNode[];
}
