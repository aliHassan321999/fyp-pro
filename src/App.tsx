import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';
import LoginPage from '@pages/Auth/LoginPage';
import RegisterPage from '@pages/Auth/RegisterPage';
import DashboardLayout from '@layouts/DashboardLayout';

import ForgotPasswordPage from '@pages/Auth/ForgotPasswordPage';
import VerifyOTPPage from '@pages/Auth/VerifyOTPPage';

// Lazy import pages (to be created)
import ResidentDashboard from '@pages/Resident/DashboardPage';
import SubmitComplaintPage from '@pages/Resident/SubmitComplaintPage';
import MyComplaintsPage from '@pages/Resident/MyComplaintsPage';
import ComplaintDetailPage from '@pages/Resident/ComplaintDetailPage';
import FeedbackFormPage from '@pages/Resident/FeedbackFormPage';
import ProfilePage from '@pages/Resident/ProfilePage';

import StaffDashboard from '@pages/Staff/DashboardPage';
import AssignedComplaintsPage from '@pages/Staff/AssignedComplaintsPage';

import DepartmentDashboard from '@pages/Department/DashboardPage';
import DepartmentStaffPage from '@pages/Department/StaffPage';
import DepartmentComplaintsPage from '@pages/Department/ComplaintsPage';
import DepartmentPerformancePage from '@pages/Department/PerformancePage';

import AdminDashboard from '@pages/Admin/AdminDashboard';
import AdminDepartmentsPage from '@pages/Admin/DepartmentsPage';
import AdminApproveResidentsPage from '@pages/Admin/ApproveResidentsPage';
import DepartmentDetailPage from '@pages/Admin/DepartmentDetailPage';
import CreateStaffPage from '@pages/Admin/CreateStaffPage';

import SuperAdminDashboard from '@pages/SuperAdmin/DashboardPage';
import SuperAdminAnalyticsPage from '@pages/SuperAdmin/AnalyticsPage';
import SuperAdminReportsPage from '@pages/SuperAdmin/ReportsPage';
import SuperAdminRequestsPage from '@pages/SuperAdmin/RequestsPage';

// Common pages (available for all roles)
import CommonProfilePage from '@pages/Common/ProfilePage';
import HelpSupportPage from '@pages/Common/HelpSupportPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  console.log('[ProtectedRoute Engine]', { requiredRole, isAuthenticated, isLoading, userRole: user?.role });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto text-primary-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-secondary-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('[ProtectedRoute Engine] Auth Failed. Redirecting back to LOGIN.');
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    console.log(`[ProtectedRoute Engine] Access denied! Required: "${requiredRole}", Got: "${user?.role}". Redirecting to LOGIN.`);
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  console.log('[ProtectedRoute Engine] Access Granted! Rendering children.');
  return <DashboardLayout>{children}</DashboardLayout>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Routes (No Layout) */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTPPage />} />

      {/* Resident Routes */}
      <Route
        path={ROUTES.RESIDENT_DASHBOARD}
        element={
          <ProtectedRoute requiredRole="resident">
            <ResidentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESIDENT_SUBMIT_COMPLAINT}
        element={
          <ProtectedRoute requiredRole="resident">
            <SubmitComplaintPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESIDENT_MY_COMPLAINTS}
        element={
          <ProtectedRoute requiredRole="resident">
            <MyComplaintsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESIDENT_COMPLAINT_DETAIL}
        element={
          <ProtectedRoute requiredRole="resident">
            <ComplaintDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESIDENT_FEEDBACK}
        element={
          <ProtectedRoute requiredRole="resident">
            <FeedbackFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.RESIDENT_PROFILE}
        element={
          <ProtectedRoute requiredRole="resident">
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path={ROUTES.STAFF_DASHBOARD}
        element={
          <ProtectedRoute requiredRole="staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.STAFF_ASSIGNED_COMPLAINTS}
        element={
          <ProtectedRoute requiredRole="staff">
            <AssignedComplaintsPage />
          </ProtectedRoute>
        }
      />

      {/* Department Routes */}
      <Route
        path={ROUTES.DEPARTMENT_DASHBOARD}
        element={
          <ProtectedRoute requiredRole="department">
            <DepartmentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DEPARTMENT_STAFF}
        element={
          <ProtectedRoute requiredRole="department">
            <DepartmentStaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DEPARTMENT_COMPLAINTS}
        element={
          <ProtectedRoute requiredRole="department">
            <DepartmentComplaintsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DEPARTMENT_PERFORMANCE}
        element={
          <ProtectedRoute requiredRole="department">
            <DepartmentPerformancePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_DEPARTMENTS}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDepartmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_DEPARTMENT_DETAIL}
        element={
          <ProtectedRoute requiredRole="admin">
            <DepartmentDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_CREATE_STAFF}
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateStaffPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_APPROVE_RESIDENTS}
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminApproveResidentsPage />
          </ProtectedRoute>
        }
      />

      {/* SuperAdmin Routes */}
      <Route
        path={ROUTES.SUPERADMIN_DASHBOARD}
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPERADMIN_ANALYTICS}
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminAnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPERADMIN_REPORTS}
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SUPERADMIN_REQUESTS}
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperAdminRequestsPage />
          </ProtectedRoute>
        }
      />

      {/* Common Routes (Available to all authenticated users) */}
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <CommonProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.HELP_SUPPORT}
        element={
          <ProtectedRoute>
            <HelpSupportPage />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
