import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { ROUTES, ERROR_MESSAGES } from '@constants/index';
import { LoginRequest, UserRole } from '@/types/common';
import Card from '@components/Common/Card';
import InputField from '@components/Common/InputField';
import Button from '@components/Common/Button';
import { PageMeta } from '@components/Common/PageMeta';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email or username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to determine user role and departmentId based on credentials
  const determineUserRole = (emailOrUsername: string, password: string): { role: string; departmentId?: string } | null => {
    // Mock database with departments and their staff
    const mockDepartments = {
      'DEPT-001': {
        name: 'Maintenance',
        headEmail: 'maintenance.head@company.com',
        headPassword: 'maint123',
        staff: [
          { email: 'john.doe@company.com', password: 'staff123' },
          { email: 'sarah.smith@company.com', password: 'staff123' },
          { email: 'mike.wilson@company.com', password: 'staff123' },
        ],
      },
      'DEPT-002': {
        name: 'Utilities',
        headEmail: 'utilities.head@company.com',
        headPassword: 'utils123',
        staff: [
          { email: 'emma.brown@company.com', password: 'staff123' },
          { email: 'james.davis@company.com', password: 'staff123' },
        ],
      },
      'DEPT-003': {
        name: 'Security',
        headEmail: 'security.head@company.com',
        headPassword: 'sec123',
        staff: [
          { email: 'alex.johnson@company.com', password: 'staff123' },
          { email: 'lisa.anderson@company.com', password: 'staff123' },
          { email: 'robert.taylor@company.com', password: 'staff123' },
        ],
      },
      'DEPT-004': {
        name: 'Landscaping',
        headEmail: 'landscaping.head@company.com',
        headPassword: 'land123',
        staff: [
          { email: 'david.miller@company.com', password: 'staff123' },
          { email: 'sophia.white@company.com', password: 'staff123' },
        ],
      },
    };

    // Global admins and superadmins (access all departments)
    const globalUsers: Record<string, { password: string; role: string }> = {
      'admin@company.com': { password: 'admin123', role: 'admin' },
      'superadmin@company.com': { password: 'superadmin123', role: 'superadmin' },
      'test@gmail.com': { password: 'test123', role: 'resident' },
    };

    const emailLower = emailOrUsername.toLowerCase();

    // Check global users first
    const globalUser = globalUsers[emailLower];
    if (globalUser && globalUser.password === password) {
      return { role: globalUser.role };
    }

    // Check department heads and staff
    for (const [deptId, dept] of Object.entries(mockDepartments)) {
      // Check if department head
      if (emailLower === dept.headEmail.toLowerCase() && password === dept.headPassword) {
        return { role: 'department', departmentId: deptId };
      }

      // Check if staff member
      const staffMember = dept.staff.find(s => s.email.toLowerCase() === emailLower);
      if (staffMember && staffMember.password === password) {
        return { role: 'staff', departmentId: deptId };
      }
    }

    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      // Determine user role and departmentId based on credentials
      const authResult = determineUserRole(email, password);

      if (!authResult) {
        setApiError('Invalid email/username or password');
        return;
      }

      // Create mock login request
      const loginRequest: LoginRequest = {
        email,
        password,
        role: authResult.role as UserRole,
        rememberMe,
      };

      // Call login with the auth info
      await login(loginRequest);

      // Store department ID if applicable
      if (authResult.departmentId) {
        localStorage.setItem('departmentId', authResult.departmentId);
      }

      // Navigate based on role
      const roleRoutes: Record<UserRole, string> = {
        resident: ROUTES.RESIDENT_DASHBOARD,
        staff: ROUTES.STAFF_DASHBOARD,
        department: ROUTES.DEPARTMENT_DASHBOARD,
        admin: ROUTES.ADMIN_DASHBOARD,
        superadmin: ROUTES.SUPERADMIN_DASHBOARD,
      };

      navigate(roleRoutes[authResult.role as UserRole]);
    } catch (error: any) {
      setApiError(error.message || ERROR_MESSAGES.SERVER_ERROR);
    }
  };

  const handleSignUp = () => {
    navigate(ROUTES.REGISTER);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white flex flex-col">
      <PageMeta title="Login | Complaint Management System" description="Login to your account" />
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">📋</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Complaint Management System</span>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Help Center
          </button>
          <button 
            type="button" 
            onClick={() => navigate(ROUTES.REGISTER)} 
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition-colors shadow-sm"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Login Card */}
        <div className="w-full max-w-md">
          <Card className="p-8 rounded-2xl shadow-lg border-0">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
            </div>

            {/* Error Alert */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{apiError}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase transition-colors tracking-wide"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-700 cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg"
              >
                Sign In to Portal
              </Button>
            </form>

            {/* Signup Section */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-700">
                New resident?{' '}
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.REGISTER)}
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                >
                  Create an account
                </button>
              </p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
