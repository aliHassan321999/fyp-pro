import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, Building2, Users, Lock, Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useUpdateProfileMutation } from '@/features/auth/auth.api';
import { useGetDepartmentsQuery } from '@/features/admin/admin.api';
import { Button, Card } from '@components/Common';
import { showSuccess, showError } from '@/utils/toast';

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
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const { data: departmentsData } = useGetDepartmentsQuery();
  const [activeTab, setActiveTab] = useState<'profile'>('profile');
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
  const [uploadingPicture, setUploadingPicture] = useState(false);

  const profileData = {
    fullName: user?.profile?.fullName || 'User',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    cnic: user?.profile?.cnic || '',
    role: user?.role || 'resident',
  };

  const [editForm, setEditForm] = useState({
    fullName: profileData.fullName,
    phone: profileData.phone,
  });

  // Get department name
  const getDepartmentName = () => {
    if ((user?.role === 'staff' || user?.role === 'department_head') && user?.departmentId) {
      if (!departmentsData?.data) return 'Loading...';
      const dept = departmentsData.data.find((d: any) => String(d._id) === String(user.departmentId));
      return dept?.name || 'Unassigned';
    }
    return '';
  };

  // Role-specific data
  const getRoleSpecificData = () => {
    switch (user?.role) {
      case 'resident':
        return {
          cnic: user?.profile?.cnic || '',
          address: user?.profile?.address || {},
        };
      case 'staff':
        return {
          department: getDepartmentName(),
          departmentId: user?.departmentId,
          cnic: user?.profile?.cnic || '',
          phone: user?.profile?.phone || '',
        };
      case 'department_head':
        return {
          departmentName: getDepartmentName(),
          departmentId: user?.departmentId,
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
    setEditForm({
      fullName: user?.profile?.fullName || '',
      phone: user?.profile?.phone || ''
    });
    setProfileEditMode(true);
  };

  const handleProfileSave = async () => {
    if (!editForm.fullName.trim()) {
      showError("Full name is strictly required.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('fullName', editForm.fullName);
      formData.append('phone', editForm.phone);
      
      await updateProfile(formData).unwrap();
      showSuccess('Profile updated successfully!');
      setProfileEditMode(false);
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      showError('Only JPG and PNG files are allowed');
      return;
    }

    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('fullName', user?.profile?.fullName || 'User'); // Backend strictly requires fullName
      
      await updateProfile(formData).unwrap();
      showSuccess('Profile picture updated successfully');
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to upload picture');
    } finally {
      setUploadingPicture(false);
    }
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
      </div>

      {/* Personal Information Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.profile?.avatar || user?.profile?.profileImage ? (
                    <img 
                      src={user.profile.avatar || user.profile.profileImage} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold uppercase">
                      {profileData.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a new profile picture. Accepted formats: JPG, PNG (max 5MB)
                  </p>
                  <div className="flex gap-2">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('file-upload')?.click();
                        }}
                        disabled={uploadingPicture || isUpdatingProfile}
                        className="flex items-center gap-2 px-6 py-2.5 text-base bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera className="w-4 h-4" />
                        {uploadingPicture ? 'Uploading...' : 'Upload Photo'}
                      </button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleFileUpload}
                      disabled={uploadingPicture || isUpdatingProfile}
                      className="hidden"
                    />
                  </div>
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
                  <input
                    type="text"
                    value={profileEditMode ? editForm.fullName : profileData.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    disabled={!profileEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={profileData.email}
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
                    value={profileEditMode ? editForm.phone : profileData.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
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
                    defaultValue={profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
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
                    isLoading={isUpdatingProfile}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setProfileEditMode(false)}
                    disabled={isUpdatingProfile}
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
                {user?.role === 'department_head' && 'Department Information'}
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
                        value={(roleSpecificData as any).cnic}
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
                        CNIC
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).cnic}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).phone}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).department}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department ID
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).departmentId}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Department-Specific */}
                {user?.role === 'department_head' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        Department Name
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).departmentName}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department ID
                      </label>
                      <input
                        type="text"
                        value={(roleSpecificData as any).departmentId}
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
                        value={(roleSpecificData as any).systemRole}
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
                        value={(roleSpecificData as any).permissionLevel}
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
    </div>
  );
};

export default ProfilePage;
