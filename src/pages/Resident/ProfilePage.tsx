import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
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
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!passwordForm.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Mock validation: check if current password is correct (in real app, validate with backend)
    if (passwordForm.currentPassword !== 'resident123') {
      newErrors.currentPassword = 'Current password is incorrect';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage('Password changed successfully! ✅');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to change password. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">👤</span>
          </div>
          <span className="text-base font-bold text-gray-900">Resident Profile</span>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
            🔔
          </button>
          <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0)}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-3xl">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-4 px-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Change Password
            </button>
          </div>

          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <Card variant="lg" className="p-8 rounded-2xl shadow-sm">
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 pb-8 border-b border-gray-200">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user?.profile?.fullName || user?.email}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
                    <div className="mt-3 inline-block bg-blue-100 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.profile?.fullName || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Phone */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={user?.profile?.phone || user?.profile?.phoneNumber || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Unit/Apartment Number */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-2">
                      Unit/Apartment Number
                    </label>
                    <input
                      type="text"
                      value={user?.profile?.address?.houseNumber || 'N/A'}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  {/* Member Since */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-900 mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString() : 'N/A'}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Account Status</p>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    <span className="text-sm text-blue-800">Active and Verified ✓</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <Card variant="lg" className="p-8 rounded-2xl shadow-sm">
              <div className="space-y-6">
                {/* Header */}
                <div className="pb-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Change Your Password</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep your account secure by using a strong password.
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <X className="w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-800 font-medium">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Password Form */}
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-900 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12 ${
                          errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-xs font-medium text-gray-900 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your new password"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12 ${
                          errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                    )}
                    
                    {/* Password Requirements */}
                    {passwordForm.newPassword && (
                      <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="text-xs font-bold text-gray-900 mb-2">Password Requirements:</p>
                        <ul className="space-y-1 text-xs">
                          <li className={passwordForm.newPassword.length >= 8 ? 'text-blue-700' : 'text-gray-600'}>
                            ✓ At least 8 characters
                          </li>
                          <li className={/[A-Z]/.test(passwordForm.newPassword) ? 'text-blue-700' : 'text-gray-600'}>
                            ✓ One uppercase letter
                          </li>
                          <li className={/[a-z]/.test(passwordForm.newPassword) ? 'text-blue-700' : 'text-gray-600'}>
                            ✓ One lowercase letter
                          </li>
                          <li className={/\d/.test(passwordForm.newPassword) ? 'text-blue-700' : 'text-gray-600'}>
                            ✓ One number
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-900 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm your new password"
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12 ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="primary"
                      fullWidth
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating Password...' : 'Change Password'}
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      type="button"
                      onClick={() => {
                        setPasswordForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                        setErrors({});
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </form>

                {/* Security Tips */}
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <p className="text-xs font-semibold text-blue-900 mb-2">🔒 Security Tips:</p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Use a unique password you don't use elsewhere</li>
                    <li>• Avoid using personal information (name, phone, etc.)</li>
                    <li>• Never share your password with anyone</li>
                    <li>• Change your password regularly for better security</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
