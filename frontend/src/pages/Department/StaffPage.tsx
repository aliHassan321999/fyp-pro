import React, { useState, useEffect } from 'react';
import { Search, Trash2, Edit2, X, Loader, TrendingUp, AlertCircle, User, Plus, MoreVertical, FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import axios from 'axios';
import { showSuccess, showError } from '@/utils/toast';

interface StaffMember {
  _id: string;
  profile: {
    fullName: string;
    avatar?: string;
    profileImage?: string;
    position?: string;
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
    cnic: '',
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
      showSuccess('Staff member updated successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update staff');
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
      showSuccess('Staff member deleted successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete staff');
    }
  };

  const handleViewPerformance = (member: StaffMember) => {
    setSelectedStaff(member);
    setShowPerformanceModal(true);
  };

  const handleAddStaff = async () => {
    if (!addStaffForm.fullName || !addStaffForm.email || !addStaffForm.password || !addStaffForm.post) {
      showError('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/users',
        {
          fullName: addStaffForm.fullName,
          email: addStaffForm.email,
          phone: addStaffForm.phone,
          cnic: addStaffForm.cnic,
          password: addStaffForm.password,
          post: addStaffForm.post,
          role: 'staff',
          departmentId: user?.departmentId,
        },
        { withCredentials: true }
      );

      // Refetch the entire list from backend to get populated fields and stats
      await fetchStaff();
      
      setShowAddStaffModal(false);
      setAddStaffForm({ fullName: '', email: '', phone: '', cnic: '', password: '', post: '' });
      showSuccess('Staff member added successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to add staff');
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
              <Card 
                key={member._id} 
                className="relative overflow-visible group hover:shadow-2xl transition-all duration-400 border border-slate-200 hover:border-primary-300 bg-white !p-6"
              >
                {/* Action Menu (Absolute Top Right) */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => setShowStaffActionMenu(showStaffActionMenu === member._id ? null : member._id)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-all shadow-sm border border-slate-200 focus:outline-none"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Dropdown Menu */}
                  {showStaffActionMenu === member._id && (
                    <div className="absolute right-0 top-12 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/50 py-2 z-50 transform origin-top-right transition-all">
                      <button
                        onClick={() => {
                          handleViewPerformance(member);
                          setShowStaffActionMenu(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-blue-50 flex items-center gap-3 transition-colors text-sm font-medium"
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
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-emerald-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      >
                        <FileText className="w-4 h-4 text-emerald-600" />
                        Generate Report
                      </button>

                      <button
                        onClick={() => {
                          handleEdit(member);
                          setShowStaffActionMenu(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-purple-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      >
                        <Edit2 className="w-4 h-4 text-purple-600" />
                        Edit Staff
                      </button>

                      <div className="border-t border-slate-100 my-1.5"></div>

                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setShowDeleteConfirm(true);
                          setShowStaffActionMenu(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Staff
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col h-full">
                  {/* Header / Profile Section */}
                  <div className="flex items-center gap-5 mb-6 pr-10">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-tr from-primary-400 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-50 transition-opacity duration-500"></div>
                      {member.profile?.avatar || member.profile?.profileImage ? (
                        <img
                          src={member.profile.avatar || member.profile.profileImage}
                          alt={member.profile.fullName}
                          className="w-16 h-16 rounded-full object-cover border-[3px] border-white relative z-10 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-blue-100 rounded-full flex items-center justify-center border-[3px] border-white relative z-10 shadow-sm">
                          <User className="w-7 h-7 text-primary-600" />
                        </div>
                      )}
                      {/* Status indicator dot */}
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full z-20"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate group-hover:text-primary-600 transition-colors">
                        {member.profile.fullName}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium truncate">{member.email}</p>
                      
                      <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/50 shadow-sm">
                          Active
                        </span>
                        {member.profile.position && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100/50 shadow-sm">
                            {member.profile.position}
                          </span>
                        )}
                        <span className="text-[12px] text-slate-400 font-medium tracking-wide">
                          Joined {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phone Info if available */}
                  {member.phone && (
                    <div className="mb-6 px-4 py-2.5 bg-slate-50/80 rounded-lg border border-slate-100 flex items-center gap-3">
                       <span className="text-slate-400 text-sm">📞</span>
                       <span className="text-sm font-semibold text-slate-700 tracking-wide">{member.phone}</span>
                    </div>
                  )}

                  {/* Stats Grid - Modern Look */}
                  <div className="grid grid-cols-4 gap-3 mb-8">
                    <div className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-2xl font-black text-slate-700">{stats.assigned}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Assigned</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-gradient-to-b from-blue-50/50 to-white border border-blue-100 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-2xl font-black text-blue-600">{stats.inProgress}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 mt-1">Progress</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-100 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-2xl font-black text-amber-500">{stats.pending}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mt-1">Pending</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-3.5 rounded-xl bg-gradient-to-b from-emerald-50/50 to-white border border-emerald-100 shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-2xl font-black text-emerald-600">{stats.completed}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 mt-1">Completed</span>
                    </div>
                  </div>

                  {/* Efficiency Progress Bar - Pushed to bottom */}
                  <div className="space-y-3 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-md">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 tracking-wide">Efficiency Score</span>
                      </div>
                      <span className={`text-lg font-black ${efficiency >= 80 ? 'text-emerald-500' : efficiency >= 50 ? 'text-blue-500' : 'text-amber-500'}`}>
                        {efficiency}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                          efficiency >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                          efficiency >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 
                          'bg-gradient-to-r from-amber-400 to-amber-500'
                        }`}
                        style={{ width: `${Math.max(efficiency, 2)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                      </div>
                    </div>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <Card variant="lg" className="w-full max-w-md p-0 overflow-hidden shadow-2xl border-0">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Edit Profile</h2>
                  <p className="text-primary-100 text-sm font-medium">Update staff information</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm font-medium text-slate-800"
                  placeholder="Enter full name"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow shadow-sm font-medium text-slate-800"
                  placeholder="Enter phone number"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Email <span className="text-slate-400 font-normal lowercase">(Read-only)</span>
                </label>
                <div className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed">
                  {selectedStaff.email}
                </div>
              </div>
            </div>

            <div className="p-6 pt-2 bg-slate-50 flex gap-3">
              <Button
                variant="outline"
                fullWidth
                className="py-3 font-bold bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                className="py-3 font-bold bg-gradient-to-r from-primary-600 to-primary-700 border-0 shadow-md hover:shadow-lg"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <Card variant="lg" className="w-full max-w-lg p-0 overflow-hidden shadow-2xl border-0">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 p-6 flex items-start justify-between">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 flex items-center gap-4">
                {selectedStaff.profile?.avatar || selectedStaff.profile?.profileImage ? (
                  <img
                    src={selectedStaff.profile.avatar || selectedStaff.profile.profileImage}
                    alt={selectedStaff.profile.fullName}
                    className="w-16 h-16 rounded-full border-4 border-white/20 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/20 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{selectedStaff.profile.fullName}</h2>
                  <p className="text-blue-100 font-medium text-sm flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Performance Overview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPerformanceModal(false)}
                className="relative z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50">
              {/* Complaint Statistics */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned</p>
                    <p className="text-2xl font-black text-slate-800">
                      {complaintStats[selectedStaff._id]?.assigned || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-black text-slate-800">
                      {complaintStats[selectedStaff._id]?.pending || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
                    <p className="text-2xl font-black text-slate-800">
                      {complaintStats[selectedStaff._id]?.inProgress || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-black text-slate-800">
                      {complaintStats[selectedStaff._id]?.completed || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-md">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-slate-700 tracking-wide">Efficiency Score</span>
                  </div>
                  <span className={`text-xl font-black ${
                    (complaintStats[selectedStaff._id]?.assigned > 0 ? Math.round((complaintStats[selectedStaff._id].completed / complaintStats[selectedStaff._id].assigned) * 100) : 0) >= 80 ? 'text-emerald-500' :
                    (complaintStats[selectedStaff._id]?.assigned > 0 ? Math.round((complaintStats[selectedStaff._id].completed / complaintStats[selectedStaff._id].assigned) * 100) : 0) >= 50 ? 'text-blue-500' : 'text-amber-500'
                  }`}>
                    {complaintStats[selectedStaff._id]?.assigned > 0
                      ? Math.round(
                          (complaintStats[selectedStaff._id].completed /
                            complaintStats[selectedStaff._id].assigned) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                      (complaintStats[selectedStaff._id]?.assigned > 0 ? Math.round((complaintStats[selectedStaff._id].completed / complaintStats[selectedStaff._id].assigned) * 100) : 0) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
                      (complaintStats[selectedStaff._id]?.assigned > 0 ? Math.round((complaintStats[selectedStaff._id].completed / complaintStats[selectedStaff._id].assigned) * 100) : 0) >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 
                      'bg-gradient-to-r from-amber-400 to-amber-500'
                    }`}
                    style={{ width: `${Math.max(complaintStats[selectedStaff._id]?.assigned > 0 ? Math.round((complaintStats[selectedStaff._id].completed / complaintStats[selectedStaff._id].assigned) * 100) : 0, 2)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center mt-3 font-medium">Based on assigned vs completed task ratio</p>
              </div>

              <Button
                variant="outline"
                fullWidth
                className="py-3 font-bold bg-white hover:bg-slate-50 shadow-sm border-slate-200"
                onClick={() => setShowPerformanceModal(false)}
              >
                Close Performance View
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <Card variant="lg" className="w-full max-w-sm p-0 overflow-hidden shadow-2xl border-0">
            <div className="p-8 text-center bg-white">
              <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-60"></div>
                <div className="relative bg-red-100 rounded-full w-20 h-20 flex items-center justify-center border-4 border-white shadow-md">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Delete Staff?</h2>
              <p className="text-slate-500 mt-3 font-medium leading-relaxed">
                You are about to permanently delete <br/>
                <strong className="text-slate-800">{selectedStaff.profile.fullName}</strong>.<br/>
                <span className="text-red-500 font-semibold">This action cannot be undone.</span>
              </p>
            </div>

            <div className="p-6 pt-0 bg-white flex gap-3">
              <Button
                variant="outline"
                fullWidth
                className="py-3 font-bold bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
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
                className="py-3 font-bold bg-red-600 border-0 shadow-md hover:bg-red-700 hover:shadow-lg"
                onClick={handleDelete}
              >
                Yes, Delete
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
                  setAddStaffForm({ fullName: '', email: '', phone: '', cnic: '', password: '', post: '' });
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

                {/* CNIC */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-semibold text-secondary-900 mb-2">
                    CNIC
                  </label>
                  <InputField
                    placeholder="xxxxx-xxxxxxx-x"
                    value={addStaffForm.cnic}
                    onChange={(e) => setAddStaffForm({ ...addStaffForm, cnic: e.target.value })}
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
                    setAddStaffForm({ fullName: '', email: '', phone: '', cnic: '', password: '', post: '' });
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
