import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle, Eye, EyeOff, Building, HelpCircle, Home } from 'lucide-react';
import { Button, Card, InputField } from '@components/Common';
import { ROUTES } from '@constants/index';
import { PageMeta } from '@components/Common/PageMeta';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    block: '',
    houseNumber: '',
    street: '',
    phoneNumber: '',
    cnic: '',
    document: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.block.trim()) {
      newErrors.block = 'Block is required';
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'House number is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.cnic.trim()) {
      newErrors.cnic = 'CNIC is required';
    } else if (formData.cnic.length < 13) {
      newErrors.cnic = 'CNIC must be at least 13 characters';
    }

    if (!formData.document) {
      newErrors.document = 'Proof document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, document: file });
      if (errors.document) {
        setErrors({ ...errors, document: '' });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call - store registration request
    setTimeout(() => {
      // Store registration request in localStorage
      const registrationRequests = JSON.parse(localStorage.getItem('registrationRequests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        block: formData.block,
        houseNumber: formData.houseNumber,
        street: formData.street,
        phoneNumber: formData.phoneNumber,
        cnic: formData.cnic,
        documentName: formData.document?.name || 'document',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      registrationRequests.push(newRequest);
      localStorage.setItem('registrationRequests', JSON.stringify(registrationRequests));

      console.log('Registration request submitted:', newRequest);

      setSuccess(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-white">
      <PageMeta title="Create Account | Complaint Management System" description="Register a new account" />
      
      {/* Top Navbar */}
      <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Building className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">Resident Portal</span>
        </div>
        <div className="flex items-center gap-6">
          <button type="button" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Help Center
          </button>
          <button type="button" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            Contact Support
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">

      {/* Register Card */}
      <div className="w-full max-w-md">
        <Card className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold tracking-wider rounded-full mb-4">
              REGISTRATION FORM
            </div>
            <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2 tracking-tight">
              Resident Registration
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Please provide your details and property information to register for the digital portal.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-900 text-sm font-semibold">Waiting for Admin Approval</p>
                <p className="text-blue-700 text-xs mt-1">Your account registration has been submitted successfully.</p>
                <p className="text-blue-700 text-xs mt-1">An admin will review your documents and send you login credentials via email.</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="label-field">
                  Full Name
                </label>
                <InputField
                  id="fullName"
                  type="text"
                  placeholder="e.g., John Doe"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (errors.fullName) {
                      setErrors({ ...errors, fullName: '' });
                    }
                  }}
                  error={errors.fullName}
                  required
                />
              </div>

              {/* CNIC Field */}
              <div>
                <label htmlFor="cnic" className="label-field">
                  CNIC Number
                </label>
                <InputField
                  id="cnic"
                  type="text"
                  placeholder="Enter your CNIC number without dashes"
                  value={formData.cnic}
                  onChange={(e) => {
                    setFormData({ ...formData, cnic: e.target.value });
                    if (errors.cnic) {
                      setErrors({ ...errors, cnic: '' });
                    }
                  }}
                  error={errors.cnic}
                  required
                />
              </div>

              {/* Phone Number Field */}
              <div>
                <label htmlFor="phoneNumber" className="label-field">
                  Phone Number
                </label>
                <InputField
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., 0300-1234567"
                  value={formData.phoneNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, phoneNumber: e.target.value });
                    if (errors.phoneNumber) {
                      setErrors({ ...errors, phoneNumber: '' });
                    }
                  }}
                  error={errors.phoneNumber}
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="label-field">
                  Email Address
                </label>
                <InputField
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  error={errors.email}
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label-field">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) {
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    className={`input-field pr-12 w-full ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Block Field */}
              <div>
                <label htmlFor="block" className="label-field">
                  Block / Phase
                </label>
                <InputField
                  id="block"
                  type="text"
                  placeholder="e.g., Block A, Phase 1"
                  value={formData.block}
                  onChange={(e) => {
                    setFormData({ ...formData, block: e.target.value });
                    if (errors.block) {
                      setErrors({ ...errors, block: '' });
                    }
                  }}
                  error={errors.block}
                  required
                />
              </div>

              {/* House Number Field */}
              <div>
                <label htmlFor="houseNumber" className="label-field">
                  House Number
                </label>
                <InputField
                  id="houseNumber"
                  type="text"
                  placeholder="e.g., House No. 12"
                  value={formData.houseNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, houseNumber: e.target.value });
                    if (errors.houseNumber) {
                      setErrors({ ...errors, houseNumber: '' });
                    }
                  }}
                  error={errors.houseNumber}
                  required
                />
              </div>

              {/* Street Field */}
              <div>
                <label htmlFor="street" className="label-field">
                  Street
                </label>
                <InputField
                  id="street"
                  type="text"
                  placeholder="e.g., Street 4"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                    if (errors.street) {
                      setErrors({ ...errors, street: '' });
                    }
                  }}
                  error={errors.street}
                  required
                />
              </div>

              {/* Document Upload */}
              <div>
                <label htmlFor="document" className="label-field">
                  Proof Document
                </label>
                <div className="relative">
                  <input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="document"
                    className={`
                    flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer
                    transition-all duration-200
                    ${errors.document
                        ? 'border-red-300 bg-red-50'
                        : formData.document
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50'
                      }
                  `}
                  >
                    <Upload className={`w-6 h-6 mb-2 ${formData.document ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    <p className="text-sm font-medium text-gray-700">
                      {formData.document ? formData.document.name : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
                {errors.document && (
                  <p className="text-red-500 text-sm mt-1">{errors.document}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={success}
                className="mt-8"
              >
                Create Account
              </Button>
            </form>
          ) : (
            <div className="py-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Thank You for Registering!</h2>
              <p className="text-gray-600 mb-6">
                Please check your email for further instructions once the admin approves your account.
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-500">
          Complaint Management System v1.0 • All rights reserved
        </p>
      </div>
      </main>
    </div>
  );
};

export default RegisterPage;
