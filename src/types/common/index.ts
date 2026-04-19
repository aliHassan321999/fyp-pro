// User Roles
export type UserRole = 'resident' | 'staff' | 'department' | 'admin' | 'superadmin';

// Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  departmentId?: string; // For staff, department head, and admin
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  unitNumber?: string; // For residents: apartment/unit number
  address?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  departmentId?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
  signup: (request: SignupRequest) => Promise<void>;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address?: string;
  phone?: string;
}

// Complaint Types
export type ComplaintStatus = 'queued' | 'open' | 'in-progress' | 'completed' | 'pending';
export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface Complaint {
  id: string;
  ticketId?: string; // NEW: Unique ticket number for queued complaints
  residentId: string;
  departmentId: string; // Which department handles this complaint
  title: string;
  description: string;
  category: string;
  location: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedTo?: string;
  queuedAt?: string; // NEW: When complaint was queued
  queuePosition?: number; // NEW: Position in queue
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Queue Types - NEW
export interface ComplaintQueue {
  id: string;
  complaintId: string;
  departmentId: string;
  residentId: string;
  residentEmail: string;
  ticketId: string;
  priority: ComplaintPriority;
  queuedAt: string;
  requestedCategory: string;
}

export interface NotificationEmail {
  to: string;
  subject: string;
  type: 'queued' | 'assigned' | 'resolved';
  ticketId: string;
  complaintTitle: string;
  message: string;
  timestamp: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  complaintId: string;
  residentId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Staff Types
export type StaffStatus = 'available' | 'busy' | 'offline';

export interface Staff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  status: StaffStatus;
  activeComplaints?: number; // NEW: Number of active complaints
  maxCapacity?: number; // NEW: Max complaints staff can handle
  totalAssigned: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  createdAt: string;
}

// Department Types
export interface Department {
  id: string;
  name: string;
  headId?: string;
  description?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Admin Types
export interface AdminStats {
  totalComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  totalStaff: number;
  departmentsCount: number;
  residentApprovals: number;
}

// SuperAdmin Types
export interface SuperAdminStats {
  totalAdmins: number;
  totalDepartments: number;
  totalComplaints: number;
  totalResidents: number;
  averageResolutionTime: number;
}
