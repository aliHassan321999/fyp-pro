import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { ROUTES } from '@constants/index';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import { PageMeta } from '@components/Common/PageMeta';
import { showSuccess, showError } from '@/utils/toast';
import axios from 'axios';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  useEffect(() => {
    // Protect route
    if (!email || !otp) {
      navigate(ROUTES.FORGOT_PASSWORD);
    }
  }, [email, otp, navigate]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword });
      showSuccess('Password reset successfully! You can now login.');
      navigate(ROUTES.LOGIN);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white flex flex-col">
      <PageMeta title="Reset Password | Complaint Management System" description="Set your new password" />
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">📋</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Complaint Management System</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 rounded-2xl shadow-lg border-0">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
                <Lock className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-2">New Password</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Create a strong new password for your account.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Reset Password</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
