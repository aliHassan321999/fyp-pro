import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card } from '@components/Common';
import axios from 'axios';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordError {
  [key: string]: string;
}

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const isDepartmentUser = user?.role === 'department_head' || user?.role === 'superadmin';
  const [activeTab, setActiveTab] = useState<'password'>('password');
  
  // Password Change State
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

  const [passwordErrors, setPasswordErrors] = useState<PasswordError>({});
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Password validation
  const validatePassword = (): boolean => {
    const newErrors: PasswordError = {};

    if (!passwordForm.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');

    if (!validatePassword()) {
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const response = await axios.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Clear message after 5 seconds
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to change password';
      setPasswordErrors({ submit: errorMsg });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isDepartmentUser ? (
          // For Department Users: Show only Password Section
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                <span className="text-2xl">🔐</span>
              </div>

              {passwordSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  ✓ {passwordSuccess}
                </div>
              )}

              {passwordErrors.submit && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  ✕ {passwordErrors.submit}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">🔒</span>Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">🔑</span>New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your new password (min 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="mr-2">✓</span>Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Re-enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </Card>
          </div>
        ) : (
          // For Other Users: Show Full Settings with Sidebar
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* No Sidebar - Only Password Section */}

            {/* Main Content Area */}
            <div className="lg:col-span-4">
            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

                {passwordSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    ✓ {passwordSuccess}
                  </div>
                )}

                {passwordErrors.submit && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    ✕ {passwordErrors.submit}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            current: !showPasswords.current,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
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
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your new password (min 8 characters)"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Re-enter your new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </Card>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
