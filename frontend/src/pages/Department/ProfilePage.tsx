import React, { useState, useRef } from 'react';
import { Upload, Trash2, User, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import { useUpdateProfileMutation } from '@/features/auth/auth.api';
import { showSuccess, showError } from '@/utils/toast';

const DepartmentProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(user?.profile?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(user?.profile?.fullName || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [block, setBlock] = useState(user?.profile?.address?.block || '');
  const [houseNumber, setHouseNumber] = useState(user?.profile?.address?.houseNumber || '');
  
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      showError('Full name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('phone', phone);
      formData.append('block', block);
      formData.append('houseNumber', houseNumber);
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      await updateProfile(formData).unwrap();
      showSuccess('Profile updated successfully');
      setSelectedFile(null);
      refetchUser?.();
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">My Profile</h1>
        <p className="text-secondary-600 mt-2">Manage your profile information and avatar</p>
      </div>

      {/* Profile Picture Section */}
      <Card variant="md" className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden border-4 border-blue-200">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-16 h-16 text-blue-600" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadClick}
                icon={<Upload className="w-4 h-4" />}
              >
                Upload
              </Button>
              {previewImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="text-red-600 border-red-200"
                >
                  Delete
                </Button>
              )}
            </div>
            <p className="text-xs text-secondary-500 text-center">
              JPG, PNG or GIF (Max 5MB)
            </p>
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-900">Email</label>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                <Mail className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-700">{user?.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-900">Role</label>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                <User className="w-5 h-5 text-secondary-400" />
                <span className="text-secondary-700 capitalize">{user?.role?.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-secondary-900">Account Status</label>
              <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-secondary-700 capitalize">{user?.accountStatus || 'Active'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Edit Information</h2>
        
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-secondary-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-secondary-900 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                Block/Area
              </label>
              <input
                type="text"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g., Block A"
                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-900 mb-2">
                House/Unit Number
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="e.g., 123"
                className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              isLoading={isLoading}
              disabled={isLoading}
              icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DepartmentProfilePage;
