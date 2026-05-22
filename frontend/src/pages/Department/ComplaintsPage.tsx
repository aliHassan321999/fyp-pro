import React, { useState } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Button, Card, InputField } from '@components/Common';
import { useGetComplaintsQuery, useGetStaffQuery, useAssignComplaintMutation } from '@/features/complaint/complaint.api';
import { showSuccess, showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';

const DepartmentComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Redux Mapping
  const { data: complaintsMap, isLoading, isError, error } = useGetComplaintsQuery();
  const { data: staffMap, isLoading: isStaffLoading } = useGetStaffQuery();
  const [assignComplaint, { isLoading: isAssigning }] = useAssignComplaintMutation();

  // Assignment Internal State
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedStaffIds, setSelectedStaffIds] = useState<Record<string, string>>({});

  const complaints = complaintsMap?.data || [];
  const staffMembers = staffMap?.data || [];

  const filteredComplaints = complaints.filter((complaint: any) => {
    const titleMatch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || complaint.status === filterStatus;
    return titleMatch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-indigo-100 text-indigo-800';
      case 'open':
      case 'pending':
      case 'pending_assignment':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAssign = async (complaintId: string) => {
    const staffId = selectedStaffIds[complaintId];
    if (!staffId) {
       showError("Please select a staff member first.");
       return;
    }

    setAssigningId(complaintId);
    try {
      const complaintMatch = complaints.find((c: any) => c._id === complaintId);
      if (complaintMatch?.status === 'assigned') {
         const proceed = window.confirm("Reassign this complaint to a new staff member?");
         if (!proceed) {
           setAssigningId(null);
           return;
         }
      }

      await assignComplaint({ id: complaintId, assignedStaffId: staffId }).unwrap();
      showSuccess("Complaint assigned successfully");
      setSelectedStaffIds(prev => {
         const newMap = {...prev};
         delete newMap[complaintId];
         return newMap;
      });
    } catch (err: any) {
      showError(err?.data?.message || "Failed to assign complaint");
    } finally {
      setAssigningId(null);
    }
  };

  const handleStaffSelect = (complaintId: string, staffId: string) => {
    setSelectedStaffIds(prev => ({ ...prev, [complaintId]: staffId }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading complaints...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load complaints</h3>
        <p className="text-slate-500 text-center max-w-md">
          {((error as any)?.data?.message) || "Unable to retrieve complaints. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Complaints Management</h1>
        <p className="text-secondary-600 mt-2">
          {filteredComplaints.length} complaints
        </p>
      </div>

      {/* Search and Filter */}
      <Card variant="md" className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending_assignment">Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <Card variant="md" className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No complaints found</p>
          </Card>
        ) : (
          filteredComplaints.map((complaint: any) => (
            <Card key={complaint._id} variant="md" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Complaint Info */}
                <div 
                  className="md:col-span-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                >
                  <h3 className="font-semibold text-secondary-900">{complaint.title || 'Untitled'}</h3>
                  <p className="text-xs text-secondary-500 mt-1">ID: {complaint._id}</p>
                </div>

                {/* Priority */}
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority?.toUpperCase() || 'NORMAL'}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-secondary-500 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Assignment */}
                <div>
                  {complaint.status === 'pending_assignment' || complaint.status === 'assigned' ? (
                    <div className="flex gap-1">
                      <select 
                        className="flex-1 text-xs px-2 py-1 border border-secondary-200 rounded focus:ring-2 focus:ring-blue-500"
                        value={selectedStaffIds[complaint._id] || ''}
                        onChange={(e) => handleStaffSelect(complaint._id, e.target.value)}
                      >
                        <option value="">Select</option>
                        {staffMembers.map((staff: any) => (
                          <option key={staff._id} value={staff._id}>{staff.profile?.fullName || staff.email}</option>
                        ))}
                      </select>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAssign(complaint._id)}
                        isLoading={assigningId === complaint._id}
                        disabled={!selectedStaffIds[complaint._id]}
                      >
                        Assign
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-secondary-500">No action</span>
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

export default DepartmentComplaintsPage;
