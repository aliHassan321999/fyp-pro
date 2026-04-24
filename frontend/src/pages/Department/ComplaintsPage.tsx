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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'open':
      case 'pending':
      case 'pending_assignment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Complaints Management</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Manage and assign {filteredComplaints.length} active complaints
        </p>
      </div>

      {/* Search and Filter */}
      <Card variant="md" className="p-6 border-t-[3px] border-t-blue-600 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-56">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-4 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending_assignment">Unassigned</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card variant="md" className="p-16 text-center border border-dashed border-slate-300 bg-slate-50/50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No complaints found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters.</p>
          </Card>
        ) : (
          filteredComplaints.map((complaint: any) => (
            <Card 
              key={complaint._id} 
              className="p-5 hover:shadow-lg transition-shadow group border border-slate-200 hover:border-blue-300 bg-white"
            >
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                {/* Info Section */}
                <div 
                  className="flex-1 cursor-pointer min-w-0"
                  onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {complaint.title || 'Untitled Complaint'}
                    </h3>
                    <span className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${getPriorityColor(complaint.priority)} shadow-sm`}>
                      {complaint.priority || 'NORMAL'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase tracking-widest font-bold">
                      ID: {complaint._id.substring(complaint._id.length - 8)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Created {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status and Assignment Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 xl:justify-end shrink-0">
                  {/* Status */}
                  <div className="flex flex-col xl:items-end">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Current Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(complaint.status)} shadow-sm border`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                      {complaint.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-10 bg-slate-200"></div>

                  {/* Assignment Control */}
                  <div className="w-full sm:w-auto xl:w-[320px]">
                    {complaint.status === 'pending_assignment' || complaint.status === 'assigned' ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select 
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer hover:bg-white shadow-sm"
                            value={selectedStaffIds[complaint._id] || ''}
                            onChange={(e) => handleStaffSelect(complaint._id, e.target.value)}
                          >
                            <option value="" disabled>Assign Staff...</option>
                            {staffMembers.map((staff: any) => (
                              <option key={staff._id} value={staff._id}>
                                {staff.profile?.fullName || staff.email}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                        <Button 
                          variant="primary" 
                          className="px-5 py-2.5 rounded-lg shadow-sm whitespace-nowrap font-bold tracking-wide text-sm bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAssign(complaint._id)}
                          isLoading={assigningId === complaint._id}
                          disabled={!selectedStaffIds[complaint._id]}
                        >
                          Assign
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col xl:items-center justify-center h-full px-4">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Action</span>
                        <span className="text-sm font-bold text-slate-600 mt-0.5">Actively Managed</span>
                      </div>
                    )}
                  </div>
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
