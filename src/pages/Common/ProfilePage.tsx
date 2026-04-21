import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Building2, Users, Lock, Camera } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card } from '@components/Common';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordError {
  [key: string]: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<PasswordError>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);

  // Mock user data for display (in real app, would come from user object)
  const mockProfileData = {
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@example.com',
    phone: user?.phone || '+92-300-1234567',
    profilePicture: user?.avatar || 'https://via.placeholder.com/150',
    role: user?.role || 'resident',
  };

  // Role-specific data
  const getRoleSpecificData = () => {
    switch (user?.role) {
      case 'resident':
        return {
          cnic: '12345-1234567-1',
          houseNumber: '45',
          block: 'B',
        };
      case 'staff':
        return {
          department: 'Maintenance',
          availabilityStatus: 'Available',
          complaintsClosed: 47,
          averageResolutionTime: '2.5 days',
        };
      case 'department':
        return {
          departmentName: 'Maintenance Department',
          staffCount: 12,
          totalComplaints: 156,
          completionRate: '94%',
        };
      case 'admin':
      case 'superadmin':
        return {
          systemRole: user?.role === 'admin' ? 'System Administrator' : 'Super Administrator',
          permissionLevel: user?.role === 'admin' ? 'Department Management' : 'Full System Access',
        };
      default:
        return {};
    }
  };

  const roleSpecificData = getRoleSpecificData();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: PasswordError = {};

    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('[Password Change] Current:', passwordForm.currentPassword);
      console.log('[Password Change] New:', passwordForm.newPassword);
      
      setSuccessMessage('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setIsSubmitting(false);

      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }, 1500);
  };

  const handleEditProfile = () => {
    console.log('[Edit Profile] Opening profile editor for role:', user?.role);
    setProfileEditMode(!profileEditMode);
  };

  const handleProfileSave = () => {
    console.log('[Save Profile] Profile data saved:', mockProfileData);
    setProfileEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and personal information</p>
      </div>

      {/* Profile Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('profile'); setProfileEditMode(false); }}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Personal Information
        </button>
        <button
          onClick={() => { setActiveTab('password'); setSuccessMessage(''); }}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <img
                  src={mockProfileData.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a new profile picture. Accepted formats: JPG, PNG (max 5MB)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="flex items-center gap-2"
                      disabled
                    >
                      <Camera className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <Button
                      variant="secondary"
                      disabled
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">(UI Preview - No actual upload)</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Common Profile Information Card */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Common Information
                </h2>
                {!profileEditMode && (
                  <Button
                    variant="secondary"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={mockProfileData.firstName}
                      disabled={!profileEditMode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm disabled:bg-gray-100"
                    />
                    <input
                      type="text"
                      defaultValue={mockProfileData.lastName}
                      disabled={!profileEditMode}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={mockProfileData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">(Read-only)</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue={mockProfileData.phone}
                    disabled={!profileEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={mockProfileData.role.charAt(0).toUpperCase() + mockProfileData.role.slice(1)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">(Read-only)</p>
                </div>
              </div>

              {profileEditMode && (
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleProfileSave}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setProfileEditMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Role-Specific Information Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {user?.role === 'resident' && 'Resident Information'}
                {user?.role === 'staff' && 'Staff Information'}
                {user?.role === 'department' && 'Department Information'}
                {(user?.role === 'admin' || user?.role === 'superadmin') && 'System Role Information'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resident-Specific */}
                {user?.role === 'resident' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNIC
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).cnic}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        House Number
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).houseNumber}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Block
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).block}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Staff-Specific */}
                {user?.role === 'staff' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).department}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability Status
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).availabilityStatus}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complaints Closed
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).complaintsClosed}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Avg. Resolution Time
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).averageResolutionTime}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Department-Specific */}
                {user?.role === 'department' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        Department Name
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).departmentName}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Staff Count
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).staffCount}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Complaints
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).totalComplaints}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Completion Rate
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).completionRate}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Admin/SuperAdmin-Specific */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Role
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).systemRole}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permission Level
                      </label>
                      <input
                        type="text"
                        defaultValue={(roleSpecificData as any).permissionLevel}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Account Settings Tab (Password Change) */}
      {activeTab === 'password' && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h2>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">{successMessage}</p>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded-lg pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded-lg pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 border rounded-lg pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> For security purposes, you'll be logged out after changing your password. You'll need to log in again with your new password.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
