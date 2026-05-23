import React, { useState } from 'react';
import { useCreateStaffMutation, useGetDepartmentsQuery } from '@/features/admin/admin.api';
import { showSuccess, showError } from '@/utils/toast';
import { Card, Button, InputField } from '@components/Common';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const CreateStaffPage: React.FC = () => {
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const { data: departmentsData, isLoading: isLoadingDeps } = useGetDepartmentsQuery();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cnic: '',
    password: '',
    departmentId: '',
    post: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff({
        ...formData,
        departmentId: formData.departmentId || null
      }).unwrap();
      showSuccess('Staff created successfully');
      setFormData({ fullName: '', email: '', phone: '', cnic: '', password: '', departmentId: '', post: '' });
    } catch (err: any) {
      showError(err.data?.message || 'Failed to create staff account');
    }
  };

  const departments = departmentsData?.data || [];

  // Get positions for selected department
  const selectedDeptObj = departments.find((d: any) => d._id === formData.departmentId);
  const departmentPositions = selectedDeptObj?.positions || [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b border-slate-200 pb-4">Add New Staff Member</h1>
        <p className="text-slate-500 mt-2 font-medium">Create a new staff account. Department can be assigned now or later.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Card className="flex-1 p-8 border-t-[3px] border-t-blue-600 shadow-sm border-slate-200">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="FULL NAME"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
                disabled={isCreating}
              />
              <InputField
                label="EMAIL ADDRESS"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@example.com"
                required
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="PHONE NUMBER"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+92 (300) 0000000"
                required
                disabled={isCreating}
              />
              <InputField
                label="CNIC"
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="xxxxx-xxxxxxx-x"
                required
                disabled={isCreating}
              />
            </div>

            <div className="relative">
              <InputField
                label="PASSWORD"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isCreating}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">DEPARTMENT</label>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">(OPTIONAL)</span>
              </div>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={isCreating || isLoadingDeps}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white appearance-none"
              >
                <option value="">Select a department...</option>
                {departments.map((dep: any) => (
                  <option key={dep._id} value={dep._id}>{dep.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">STAFF POST (POSITION)</label>
              <select
                name="post"
                value={formData.post}
                onChange={handleChange}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white appearance-none"
              >
                <option value="">Select Position...</option>
                {departmentPositions.length > 0 ? (
                  departmentPositions.map((p: string) => (
                    <option key={p} value={p}>{p}</option>
                  ))
                ) : (
                  <>
                    <option value="Junior Staff">Junior Staff</option>
                    <option value="Standard Staff">Standard Staff</option>
                    <option value="Senior Staff">Senior Staff</option>
                    <option value="Technician">Technician</option>
                    <option value="Supervisor">Supervisor</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex justify-end items-center gap-4 mt-4 pt-6 border-t border-slate-100">
              <span className="text-sm font-medium text-slate-500 mr-auto cursor-pointer hover:text-slate-700" onClick={() => setFormData({ fullName: '', email: '', phone: '', cnic: '', password: '', departmentId: '', post: '' })}>
                Cancel
              </span>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 shadow-sm" disabled={isCreating}>
                {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : 'Create Staff Member →'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateStaffPage;
