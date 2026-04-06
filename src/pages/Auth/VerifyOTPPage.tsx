import React, { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { ROUTES } from '@constants/index';
import Card from '@components/Common/Card';
import Button from '@components/Common/Button';
import { PageMeta } from '@components/Common/PageMeta';

const VerifyOTPPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (error) setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      newOtp[index] = char;
      if (inputRefs.current[index]) {
        inputRefs.current[index]!.value = char;
      }
    });
    setOtp(newOtp);
    if (pastedData.length < 6) {
      inputRefs.current[pastedData.length]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      inputRefs.current[5]?.blur(); // Optional: Auto submit or just blur
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.join('').length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    // Simulate API verification
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to login or reset password page based on the flow
      navigate(ROUTES.LOGIN, { state: { message: 'Password reset successful. Please login.' } });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-white flex flex-col">
      <PageMeta title="Verify OTP | Complaint Management System" description="Enter verification code" />
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
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-center mb-2">Verify OTP</h2>
              <p className="text-gray-600 text-center text-sm leading-relaxed">
                We've sent a verification code to <span className="font-semibold text-gray-900">{email}</span>.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Fields */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest text-center mb-4">
                  Enter 6-digit code
                </label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-gray-300 bg-gray-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:bg-white text-gray-900 transition-all shadow-sm outline-none"
                    />
                  ))}
                </div>
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
                <span>Verify Code</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            {/* Resend & Back section */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button type="button" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Resend it
                </button>
              </p>
              <button
                type="button"
                onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                className="flex items-center gap-2 text-blue-600 font-semibold hover:opacity-80 transition-opacity mt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Email</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
