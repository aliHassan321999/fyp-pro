import React, { useState, useRef } from 'react';
import { User as UserIcon, Mail, Phone, Home, Calendar, Camera, Save, Loader2, ShieldCheck, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/Common';
import { useNavigate } from 'react-router-dom';
import { useUpdateProfileMutation } from '@/features/auth/auth.api';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [updateProfileApi, { isLoading: isSubmitting }] = useUpdateProfileMutation();
  const [profileImage, setProfileImage] = useState<string | null>(user?.profile?.avatar || user?.profile?.profileImage || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: user?.profile?.fullName || '',
    phone: user?.profile?.phone || user?.profile?.phoneNumber || '',
    cnic: user?.profile?.cnic || '',
    houseNumber: user?.profile?.address?.houseNumber || '',
    block: user?.profile?.address?.block || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    // Construct HTTP Form Data
    const payload = new FormData();
    payload.append('fullName', formData.fullName);
    payload.append('phone', formData.phone);
    payload.append('block', formData.block);
    payload.append('houseNumber', formData.houseNumber);
    
    // Append binary file if modified
    if (selectedFile) {
      payload.append('avatar', selectedFile);
    }
    
    try {
      const res = await updateProfileApi(payload).unwrap();
      setSuccessMsg(res.message || 'Profile synchronized successfully! ✅');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.data?.message || 'Failed to update profile settings.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row pb-20 animate-fade-in">
      {/* Left Sidebar Profile Orb */}
      <div className="w-full md:w-1/3 xl:w-1/4 p-6 md:p-10 flex flex-col items-center border-r border-slate-200/60 bg-white/40">
        
        <div className="w-full flex justify-start mb-8">
           <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-sm font-bold">
             <ArrowLeft className="w-4 h-4" /> Back
           </button>
        </div>

        {/* Profile Avatar Interactive Injector Module */}
        <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
          <div className="w-40 h-40 rounded-full border-[6px] border-white shadow-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden relative">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <span className="text-white text-6xl font-black">
                {user?.profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
            
            {/* Dark Hover Masking layer */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center">
              <Camera className="w-8 h-8 text-white mb-2" />
              <span className="text-white text-[10px] font-black uppercase tracking-widest text-center px-2">Update Core Image</span>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <h1 className="text-2xl font-black text-slate-800 tracking-tight text-center mb-1 line-clamp-1 w-full px-2">
          {formData.fullName || user?.email}
        </h1>
        <p className="text-slate-400 text-sm font-semibold mb-8 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {user?.email}</p>

        {/* Security / Registry badges */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 shadow-sm transition-all hover:bg-blue-100/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><ShieldCheck className="w-5 h-5"/></div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Account Type</p>
                <p className="text-[13px] font-extrabold text-blue-900 uppercase tracking-widest">{user?.role}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><Calendar className="w-5 h-5"/></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</p>
                <p className="text-[13px] font-bold text-slate-700">{(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'short', day:'numeric', year:'numeric' }) : 'Authentic Verified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column Engine Payload */}
      <div className="flex-1 p-6 md:p-12 xl:p-16">
        <div className="max-w-3xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Profile Information</h2>
            <p className="text-slate-500 text-[15px] mt-1">Update your personal information and contact details.</p>
          </div>

          {/* Clean Success Flash Box */}
          {successMsg && (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-center gap-3 animate-fade-in shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">✓</div>
              <p className="text-emerald-800 font-bold text-sm tracking-wide">{successMsg}</p>
            </div>
          )}

          {/* Clean Error Flash Box */}
          {errorMsg && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200/60 rounded-2xl flex items-center gap-3 animate-fade-in shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">!</div>
              <p className="text-red-800 font-bold text-sm tracking-wide">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              
              {/* Full Name Node */}
              <div className="space-y-2 md:col-span-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-indigo-500 transition-colors mb-2 pl-1">
                  <UserIcon className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-5 py-4 border border-slate-200 bg-white rounded-[1rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400 transition-all font-medium text-slate-700 hover:border-slate-300 placeholder:text-slate-300"
                />
              </div>

              {/* Phone Node */}
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-blue-500 transition-colors mb-2 pl-1">
                  <Phone className="w-4 h-4" /> Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+92 300 0000000"
                  className="w-full px-5 py-4 border border-slate-200 bg-white rounded-[1rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400 transition-all font-medium text-slate-700 hover:border-slate-300 placeholder:text-slate-300"
                />
              </div>

              {/* CNIC Node (Read-Only) */}
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-2 pl-1">
                  <CreditCard className="w-4 h-4" /> Gov CNIC (Verified)
                </label>
                <input
                  type="text"
                  value={user?.profile?.cnic || ''}
                  disabled
                  title="Your CNIC is verified and legally bound to your identity."
                  className="w-full px-5 py-4 border border-slate-200 bg-slate-50/70 rounded-[1rem] shadow-inner text-slate-400 font-bold cursor-not-allowed"
                />
              </div>

              {/* Spatial Block */}
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-blue-500 transition-colors mb-2 pl-1">
                  <Home className="w-4 h-4" /> Block
                </label>
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleInputChange}
                  placeholder="E.g. Block A"
                  className="w-full px-5 py-4 border border-slate-200 bg-white rounded-[1rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400 transition-all font-medium text-slate-700 hover:border-slate-300 placeholder:text-slate-300"
                />
              </div>

              {/* Spatial Unit Address */}
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 group-hover:text-amber-500 transition-colors mb-2 pl-1">
                  <span className="w-4 h-4 flex items-center justify-center font-black">#</span> Unit / House Number
                </label>
                <input
                  type="text"
                  name="houseNumber"
                  value={formData.houseNumber}
                  onChange={handleInputChange}
                  placeholder="E.g. 102"
                  className="w-full px-5 py-4 border border-slate-200 bg-white rounded-[1rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/15 focus:border-amber-400 transition-all font-medium text-slate-700 hover:border-slate-300 placeholder:text-slate-300"
                />
              </div>

            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end">
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-4 rounded-2xl text-[15px] font-bold bg-blue-600 hover:bg-slate-900 border-none text-white shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-slate-300 transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2 tracking-wide"><Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2 tracking-wide"><Save className="w-5 h-5" /> Save Changes</span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
