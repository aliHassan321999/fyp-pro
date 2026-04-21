import type { UserRole } from '@/types/common';

// User Roles
export const USER_ROLES: Record<UserRole, string> = {
  resident: 'Resident',
  staff: 'Staff',
  department: 'Department',
  admin: 'Admin',
  superadmin: 'Super Admin',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  resident: 'File and track complaints',
  staff: 'Handle assigned complaints',
  department: 'Manage staff and complaints',
  admin: 'Manage departments and approvals',
  superadmin: 'System-wide administration',
};

// Complaint Status
export const COMPLAINT_STATUS = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
} as const;

// Complaint Priority
export const COMPLAINT_PRIORITY = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
} as const;

// Staff Status
export const STAFF_STATUS = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  busy: { label: 'Busy', color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  offline: { label: 'Offline', color: 'bg-gray-100 text-gray-800', dot: 'bg-gray-500' },
} as const;

// Routes
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',

  // Resident
  RESIDENT_DASHBOARD: '/resident/dashboard',
  RESIDENT_SUBMIT_COMPLAINT: '/resident/submit-complaint',
  RESIDENT_MY_COMPLAINTS: '/resident/my-complaints',
  RESIDENT_COMPLAINT_DETAIL: '/resident/complaint/:id',
  RESIDENT_FEEDBACK: '/resident/feedback/:id',
  RESIDENT_PROFILE: '/resident/profile',

  // Staff
  STAFF_DASHBOARD: '/staff/dashboard',
  STAFF_ASSIGNED_COMPLAINTS: '/staff/assigned-complaints',

  // Department
  DEPARTMENT_DASHBOARD: '/department/dashboard',
  DEPARTMENT_STAFF: '/department/staff',
  DEPARTMENT_COMPLAINTS: '/department/complaints',
  DEPARTMENT_PERFORMANCE: '/department/performance',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_DEPARTMENT_DETAIL: '/admin/departments/:id',
  ADMIN_CREATE_STAFF: '/admin/staff/create',
  ADMIN_APPROVE_RESIDENTS: '/admin/approve-residents',

  // SuperAdmin
  SUPERADMIN_DASHBOARD: '/superadmin/dashboard',
  SUPERADMIN_ANALYTICS: '/superadmin/analytics',
  SUPERADMIN_REPORTS: '/superadmin/reports',
  SUPERADMIN_REQUESTS: '/superadmin/requests',

  // Common Routes (Available to all roles)
  PROFILE: '/profile',
  HELP_SUPPORT: '/help-support',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh',

  // Complaints
  COMPLAINTS: '/api/complaints',
  COMPLAINT_DETAIL: '/api/complaints/:id',

  // Feedback
  FEEDBACK: '/api/feedback',

  // Staff
  STAFF: '/api/staff',
  STAFF_DETAIL: '/api/staff/:id',

  // Departments
  DEPARTMENTS: '/api/departments',
  DEPARTMENT_DETAIL: '/api/departments/:id',
} as const;

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'cms_auth_token',
  REFRESH_TOKEN: 'cms_refresh_token',
  USER: 'cms_user',
  REMEMBER_ME: 'cms_remember_me',
  SELECTED_ROLE: 'cms_selected_role',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  WEAK_PASSWORD: 'Password must be at least 8 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  INTERNAL_ERROR: 'An unexpected error occurred',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  COMPLAINT_CREATED: 'Complaint submitted successfully',
  COMPLAINT_UPDATED: 'Complaint updated successfully',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
} as const;
