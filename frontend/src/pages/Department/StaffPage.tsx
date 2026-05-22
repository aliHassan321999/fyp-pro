import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, TrendingUp, Target, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, InputField } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import { useGetDepartmentStaffQuery } from '@/features/department/department.api';
import { ROUTES } from '@/constants';

const DepartmentStaffPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch staff data
  const { data: staffResponse, isLoading, isError } = useGetDepartmentStaffQuery(
    user?.departmentId || ''
  );

  const staff = staffResponse?.data || [];

  const filteredStaff = staff.filter((member: any) =>
    member.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading staff data...</p>
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load staff</h3>
        <p className="text-slate-500 text-center">Unable to retrieve staff information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Staff Management</h1>
          <p className="text-secondary-600 mt-2">{filteredStaff.length} staff members</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.DEPARTMENT_ADD_STAFF)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Search */}
      <Card variant="md" className="p-6">
        <InputField
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Staff List */}
      <div className="space-y-4">
        {filteredStaff.length === 0 ? (
          <Card variant="md" className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No staff members found</p>
          </Card>
        ) : (
          filteredStaff.map((member: any) => (
            <Card key={member._id} variant="md" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900">
                      {member.profile?.fullName}
                    </h3>
                    <p className="text-sm text-secondary-600">{member.rank}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-secondary-600">
                      <span className="font-medium">Email:</span> {member.email}
                    </p>
                    <p className="text-secondary-600">
                      <span className="font-medium">Joined:</span>{' '}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-secondary-900">Workload</h4>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{member.stats?.assignedCount}</p>
                    <p className="text-xs text-secondary-600">Currently Assigned</p>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-green-600" />
                    <h4 className="font-semibold text-secondary-900">Performance</h4>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {member.stats?.resolvedCount}
                    </p>
                    <p className="text-xs text-secondary-600">Resolved</p>
                  </div>
                </div>

                {/* Compliance Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <h4 className="font-semibold text-secondary-900">SLA</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-lg font-bold text-amber-600">
                        {member.stats?.complianceRate}%
                      </p>
                      <p className="text-xs text-secondary-600">Compliance</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-red-600">
                        {member.stats?.slaBreaches}
                      </p>
                      <p className="text-xs text-secondary-600">Breaches</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-500 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      member.accountStatus === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {member.accountStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {member.stats?.lastActivityAt && (
                    <div>
                      <p className="text-xs text-secondary-500 mb-1">Last Activity</p>
                      <p className="text-sm text-secondary-700">
                        {new Date(member.stats.lastActivityAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  };

  // Send email with credentials (simulated)
  const sendCredentialsEmail = (staffMember: StaffMember, username: string, password: string) => {
    const emailContent = `
Dear ${staffMember.name},

Your staff account has been created! Here are your temporary login credentials:

Username: ${username}
Password: ${password}

You can now access the complaint management system and change your password on your first login.

Important: Please change your password immediately after login for security purposes.

Position: ${staffMember.position}
Email: ${staffMember.email}

Best regards,
Department Management Team
    `.trim();

    console.log(`[EMAIL SENT] To: ${staffMember.email}`);
    console.log(`[EMAIL CONTENT]: ${emailContent}`);
  };

  // Handle add staff form submission
  const handleAddStaff = () => {
    if (!newStaffForm.name || !newStaffForm.position || !newStaffForm.email || !newStaffForm.phone) {
      alert('❌ Please fill in all fields');
      return;
    }

    const { username, password } = generateDummyCredentials(newStaffForm.name, newStaffForm.email);

    const newStaff: StaffMember = {
      id: String(staff.length + 1),
      name: newStaffForm.name,
      position: newStaffForm.position,
      email: newStaffForm.email,
      phone: newStaffForm.phone,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      assignedComplaints: 0,
      completedComplaints: 0,
      dummyUsername: username,
      dummyPassword: password,
    };

    // Send email
    sendCredentialsEmail(newStaff, username, password);

    // Add staff to list
    setStaff([...staff, newStaff]);

    // Show credentials modal
    setAddedStaff(newStaff);
    setShowCredentialsModal(true);
    setShowAddModal(false);

    // Reset form
    setNewStaffForm({ name: '', position: '', email: '', phone: '' });

    alert(`✅ Staff member ${newStaffForm.name} added successfully!\nCredentials sent to ${newStaffForm.email}`);
};

export default DepartmentStaffPage;
