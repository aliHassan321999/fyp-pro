import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { ROUTES } from '@constants/index';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import InputField from '@components/Common/InputField';
import { PageMeta } from '@components/Common/PageMeta';
import securityIcon from '../../assets/icons/security.svg';
import verifiedIcon from '../../assets/icons/verified.svg';
import { showSuccess, showError } from '@/utils/toast';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);

      if (email === "notfound@example.com") {
        showError("Email does not exist");
        return;
      }
      showSuccess("Reset instructions sent");
      // Pass the email state to the next screen if desired, e.g. using navigate state
      navigate(ROUTES.VERIFY_OTP, { state: { email } });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white flex flex-col">
      <PageMeta title="Forgot Password | Complaint Management System" description="Reset your password" />
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">📋</span>
          </div>
          <span className="text-lg font-bold text-gray-900">Complaint Management System</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Card */}
        <div className="w-full max-w-md">
          <Card className="p-8 rounded-2xl shadow-lg border-0">
            {/* Brand Logo / Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6 transform -rotate-6">
                <span className="text-white text-3xl font-bold">🔒</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-2">Forgot Password</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                Enter your email address and we will send you a 6-digit verification code.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2">
                  Email Address
                </label>
                <InputField
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  icon={<Mail className="w-5 h-5" />}
                  required
                />
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Send Code</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            {/* Navigation Footer */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="flex items-center gap-2 text-blue-600 font-semibold hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </div>
          </Card>

          {/* Security Badges */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <img src={verifiedIcon} alt="Verified" className="w-4 h-4" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
              <img src={securityIcon} alt="Security" className="w-4 h-4" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">256-bit Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
