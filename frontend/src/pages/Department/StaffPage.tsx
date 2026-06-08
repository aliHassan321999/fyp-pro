import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit2, X, Loader, TrendingUp, AlertCircle, User, Plus, MoreVertical, FileText, Calendar } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import axios from 'axios';

interface StaffMember {
  _id: string;
  profile: {
    fullName: string;
    avatar?: string;
    profileImage?: string;
  };
  email: string;
  phone?: string;
  role: string;
  departmentId: string;
  createdAt: string;
}

interface ComplaintStats {
  assigned: number;
  completed: number;
  pending: number;
  inProgress: number;
}

const DepartmentStaffPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complaintStats, setComplaintStats] = useState<Record<string, ComplaintStats>>({});
  const [departmentPositions, setDepartmentPositions] = useState<string[]>([]);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAllStaffReportModal, setShowAllStaffReportModal] = useState(false);
  const [showStaffActionMenu, setShowStaffActionMenu] = useState<string | null>(null);
  
  // Selected staff for modals
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
  });
  const [addStaffForm, setAddStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    post: '',
  });
  const [reportForm, setReportForm] = useState({
    startDate: '',
    endDate: '',
  });

  // Fetch staff
  useEffect(() => {
    fetchStaff();
  }, [user?.departmentId]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.departmentId) {
        setError('No department assigned');
        setLoading(false);
        return;
      }

      // Fetch department details for positions
      const deptRes = await axios.get(
        `http://localhost:5000/api/departments/${user.departmentId}`,
        { withCredentials: true }
      );
      setDepartmentPositions(deptRes.data.data?.positions || []);

      const res = await axios.get(
        `http://localhost:5000/api/departments/${user.departmentId}/staff`,
        { withCredentials: true }
      );

      setStaff(res.data.data || []);

      // Fetch complaint stats for each staff
      const statsMap: Record<string, ComplaintStats> = {};
      const complaintsRes = await axios.get(
        'http://localhost:5000/api/complaints',
        { withCredentials: true }
      );

      const allComplaints = complaintsRes.data.data || [];
      res.data.data.forEach((member: StaffMember) => {
        const memberComplaints = allComplaints.filter((c: any) => c.assignedStaffId === member._id);
        statsMap[member._id] = {
          assigned: memberComplaints.length,
          completed: memberComplaints.filter((c: any) => c.status === 'completed').length,
          pending: memberComplaints.filter((c: any) => c.status === 'pending').length,
          inProgress: memberComplaints.filter((c: any) => c.status === 'in_progress').length,
        };
      });
      setComplaintStats(statsMap);

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to load staff');
      setLoading(false);
    }
  };

  const handleEdit = (member: StaffMember) => {
    setSelectedStaff(member);
    setEditForm({
      fullName: member.profile.fullName,
      phone: member.phone || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff || !editForm.fullName.trim()) {
      alert('❌ Name cannot be empty');
      return;
    }

    try {
      await axios.patch(
        `http://localhost:5000/api/users/${selectedStaff._id}`,
        {
          'profile.fullName': editForm.fullName,
          phone: editForm.phone,
        },
        { withCredentials: true }
      );

      setStaff(
        staff.map((s) =>
          s._id === selectedStaff._id
            ? {
                ...s,
                profile: { ...s.profile, fullName: editForm.fullName },
                phone: editForm.phone,
              }
            : s
        )
      );

      setShowEditModal(false);
      alert('✅ Staff member updated successfully');
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to update staff'));
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/users/${selectedStaff._id}`,
        { withCredentials: true }
      );

      setStaff(staff.filter((s) => s._id !== selectedStaff._id));
      setShowDeleteConfirm(false);
      setSelectedStaff(null);
      alert('✅ Staff member deleted successfully');
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to delete staff'));
    }
  };

  const handleViewPerformance = (member: StaffMember) => {
    setSelectedStaff(member);
    setShowPerformanceModal(true);
  };

  const handleAddStaff = async () => {
    if (!addStaffForm.fullName || !addStaffForm.email || !addStaffForm.password || !addStaffForm.post) {
      alert('❌ Please fill in all required fields');
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          fullName: addStaffForm.fullName,
          email: addStaffForm.email,
          phone: addStaffForm.phone,
          password: addStaffForm.password,
          post: addStaffForm.post,
          role: 'staff',
          departmentId: user?.departmentId,
        },
        { withCredentials: true }
      );

      // Add new staff to the list
      setStaff([...staff, res.data.data]);
      setShowAddStaffModal(false);
      setAddStaffForm({ fullName: '', email: '', phone: '', password: '', post: '' });
      alert('✅ Staff member added successfully');
    } catch (err: any) {
      alert('❌ ' + (err.response?.data?.message || 'Failed to add staff'));
    }
  };


  const filteredStaff = staff.filter((member) =>
    member.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 mx-auto text-primary-600 mb-4" />
          <p className="text-secondary-600">Loading staff members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="md" className="p-6 bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-700 font-semibold text-center">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Staff Management</h1>
          <p className="text-secondary-600 mt-2">{filteredStaff.length} staff members in department</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowAllStaffReportModal(true)}
          >
            <FileText className="w-5 h-5" />
            Generate All Report
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setShowAddStaffModal(true)}
          >
            <Plus className="w-5 h-5" />
            Add Staff
          </Button>
        </div>
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

      {/* Staff Cards Grid */}
      {filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredStaff.map((member) => {
            const stats = complaintStats[member._id] || {
              assigned: 0,
              completed: 0,
              pending: 0,
              inProgress: 0,
            };
            const efficiency =
              stats.assigned > 0 ? Math.round((stats.completed / stats.assigned) * 100) : 0;

            return (
              <Card key={member._id} variant="md" className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-secondary-200">
                    <div className="flex items-center gap-3">
                      {member.profile?.avatar || member.profile?.profileImage ? (
                        <img
                          src={member.profile.avatar || member.profile.profileImage}
                          alt={member.profile.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary-100"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900">
                          {member.profile.fullName}
                        </h3>
                        <p className="text-sm text-secondary-600">{member.email}</p>
                      </div>
                    </div>
                    <StatusBadge status="Active" color="bg-green-100" />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    {member.phone && (
                      <p className="text-secondary-600">
                        <span className="font-medium">Phone:</span> {member.phone}
                      </p>
                    )}
                    <p className="text-secondary-600">
                      <span className="font-medium">Joined:</span>{' '}
                      {new Date(member.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 bg-secondary-50 rounded-lg p-3">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">{stats.assigned}</p>
                      <p className="text-xs text-secondary-600">Assigned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
                      <p className="text-xs text-secondary-600">Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                      <p className="text-xs text-secondary-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{stats.completed}</p>
                      <p className="text-xs text-secondary-600">Completed</p>
                    </div>
                  </div>

                  {/* Efficiency */}
                  <div className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-secondary-900">Efficiency</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{efficiency}%</span>
                  </div>

                  {/* Action Menu */}
                  <div className="flex justify-end pt-2 relative">
                    <button
                      onClick={() => setShowStaffActionMenu(showStaffActionMenu === member._id ? null : member._id)}
                      className="p-2 hover:bg-secondary-100 rounded-lg transition"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {showStaffActionMenu === member._id && (
                      <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <button
                          onClick={() => {
                            handleViewPerformance(member);
                            setShowStaffActionMenu(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors text-sm"
                        >
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          View Performance
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setShowReportModal(true);
                            setShowStaffActionMenu(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-green-50 flex items-center gap-3 transition-colors text-sm"
                        >
                          <FileText className="w-4 h-4 text-green-600" />
                          Generate Report
                        </button>

                        <button
                          onClick={() => {
                            handleEdit(member);
                            setShowStaffActionMenu(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-purple-50 flex items-center gap-3 transition-colors text-sm"
                        >
                          <Edit2 className="w-4 h-4 text-purple-600" />
                          Edit Staff
                        </button>

                        <div className="border-t border-gray-200 my-2"></div>

                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setShowDeleteConfirm(true);
                            setShowStaffActionMenu(null);
                          }}
                          className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Staff
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="md" className="p-12 text-center">
          <User className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
          <p className="text-secondary-600">
            {searchTerm ? 'No staff members found matching your search' : 'No staff members assigned yet'}
          </p>
        </Card>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">Edit Staff Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-secondary-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Full Name
                </label>
                <InputField
                  placeholder="Enter full name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Phone Number
                </label>
                <InputField
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-900 mb-2">
                  Email (Read-only)
                </label>
                <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-600">
                  {selectedStaff.email}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleSaveEdit}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Performance Modal */}
      {showPerformanceModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="lg" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">Performance</h2>
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="p-1 hover:bg-secondary-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Staff Name */}
              <div>
                <p className="text-sm text-secondary-600 mb-1">Staff Member</p>
                <p className="text-lg font-bold text-secondary-900">
                  {selectedStaff.profile.fullName}
                </p>
              </div>

              {/* Complaint Statistics */}
              <div className="border-t border-secondary-200 pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {complaintStats[selectedStaff._id]?.assigned || 0}
                    </p>
                    <p className="text-xs text-secondary-600">Assigned</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-green-600">
                      {complaintStats[selectedStaff._id]?.completed || 0}
                    </p>
                    <p className="text-xs text-secondary-600">Completed</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-yellow-600">
                      {complaintStats[selectedStaff._id]?.pending || 0}
                    </p>
                    <p className="text-xs text-secondary-600">Pending</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-purple-600">
                      {complaintStats[selectedStaff._id]?.inProgress || 0}
                    </p>
                    <p className="text-xs text-secondary-600">In Progress</p>
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-center">
                <p className="text-sm text-secondary-600 mb-2">Completion Rate</p>
                <p className="text-3xl font-bold text-primary-600">
                  {complaintStats[selectedStaff._id]?.assigned > 0
                    ? Math.round(
                        (complaintStats[selectedStaff._id].completed /
                          complaintStats[selectedStaff._id].assigned) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowPerformanceModal(false)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-md">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900">Delete Staff Member?</h2>
              <p className="text-secondary-600 mt-2">
                Are you sure you want to delete <strong>{selectedStaff.profile.fullName}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedStaff(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-lg">
            {/* Header with Gradient Background */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-lg p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Add New Staff Member</h2>
                <p className="text-primary-100 text-sm mt-1">Fill in the details to onboard a new team member</p>
              </div>
              <button
                onClick={() => {
                  setShowAddStaffModal(false);
                  setAddStaffForm({ fullName: '', email: '', phone: '', password: '', post: '' });
                }}
                className="p-2 hover:bg-primary-500 rounded-lg transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Full Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="John Doe"
                    value={addStaffForm.fullName}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, fullName: e.target.value })}
                  />
                </div>

                {/* Staff Post */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Staff Post <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addStaffForm.post}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, post: e.target.value })}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-white text-secondary-900"
                  >
                    <option value="">Select Position</option>
                    {departmentPositions.length > 0 ? (
                      departmentPositions.map((post) => (
                        <option key={post} value={post}>
                          {post}
                        </option>
                      ))
                    ) : (
                      <option disabled>No positions available</option>
                    )}
                  </select>
                </div>

                {/* Email */}
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="john@example.com"
                    type="email"
                    value={addStaffForm.email}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, email: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Phone Number
                  </label>
                  <InputField
                    placeholder="+92 300 1234567"
                    value={addStaffForm.phone}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, phone: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    placeholder="••••••••"
                    type="password"
                    value={addStaffForm.password}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">📋 Note:</span> The staff member will receive credentials and can log in immediately after creation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowAddStaffModal(false);
                    setAddStaffForm({ fullName: '', email: '', phone: '', password: '', post: '' });
                  }}
                  className="py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleAddStaff}
                  className="py-2.5 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff Member
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Individual Staff Report Modal */}
      {showReportModal && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">Generate Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-secondary-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-secondary-600 mb-1">Staff Member</p>
                <p className="text-lg font-bold text-secondary-900">{selectedStaff.profile.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Start Date
                </label>
                <InputField
                  type="date"
                  value={reportForm.startDate}
                  onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  End Date
                </label>
                <InputField
                  type="date"
                  value={reportForm.endDate}
                  onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  // Generate report logic
                  alert(`Report generated for ${selectedStaff.profile.fullName} from ${reportForm.startDate} to ${reportForm.endDate}`);
                  setShowReportModal(false);
                }}
              >
                <FileText className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* All Staff Report Modal */}
      {showAllStaffReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card variant="md" className="w-full max-w-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">Generate All Staff Report</h2>
              <button
                onClick={() => setShowAllStaffReportModal(false)}
                className="p-1 hover:bg-secondary-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">📊 Report Info:</span> This report will include performance data for all staff members in your department.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  Start Date
                </label>
                <InputField
                  type="date"
                  value={reportForm.startDate}
                  onChange={(e) => setReportForm({ ...reportForm, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-900 mb-2">
                  End Date
                </label>
                <InputField
                  type="date"
                  value={reportForm.endDate}
                  onChange={(e) => setReportForm({ ...reportForm, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowAllStaffReportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  // Generate all staff report logic
                  alert(`Report generated for all staff from ${reportForm.startDate} to ${reportForm.endDate}`);
                  setShowAllStaffReportModal(false);
                  setReportForm({ startDate: '', endDate: '' });
                }}
              >
                <FileText className="w-4 h-4" />
                Generate
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DepartmentStaffPage;
