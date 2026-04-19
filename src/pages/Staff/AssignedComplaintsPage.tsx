import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useGetComplaintsQuery, useUpdateComplaintStatusMutation } from '@/features/complaint/complaint.api';
import { showSuccess, showError } from '@/utils/toast';

const AssignedComplaintsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  // Redux Injection Maps
  const { data: complaintsData, isLoading, isError, error } = useGetComplaintsQuery();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateComplaintStatusMutation();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newStatusValues, setNewStatusValues] = useState<Record<string, string>>({});

  // RTK handles the user._id filter automatically via Express Node
  const complaints = complaintsData?.data || [];

  const filteredComplaints = complaints.filter((complaint) => {
    const titleMatch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || complaint.status === filterStatus;
    return titleMatch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
      case 'completed':
        return 'bg-blue-100';
      case 'in_progress':
        return 'bg-yellow-100';
      case 'assigned':
      case 'open':
      case 'pending':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleUpdateStatus = async (complaintId: string) => {
    const targetStatus = newStatusValues[complaintId];
    if (!targetStatus) {
      showError("Please select a valid transition state.");
      return;
    }

    setUpdatingId(complaintId);
    try {
      await updateStatus({ id: complaintId, status: targetStatus as any }).unwrap();
      showSuccess("Status updated successfully");
      // Reset expanded block so UI is clean
      setSelectedComplaint(null);
    } catch (err: any) {
      showError(err?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusChange = (complaintId: string, status: string) => {
    setNewStatusValues(prev => ({ ...prev, [complaintId]: status }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium tracking-wide">Syncing Staff Ticket Matrix...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Network Error</h3>
        <p className="text-slate-500 text-center max-w-md">
           {((error as any)?.data?.message) || "Unable to sync explicit Staff routes. Verify uplink."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Assignments</h1>
        <p className="text-slate-600 mt-2 font-medium">
          {filteredComplaints.length} tickets mapped to your explicit pipeline
        </p>
      </div>

      {/* Constraints Mapping */}
      <Card variant="md" className="p-6 shadow-sm border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              placeholder="Search explicitly by subject node..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="all">All States</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Ticket Output Grid */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint) => (
            <Card
              key={complaint._id}
              variant="md"
              className={`p-6 cursor-pointer transition-all border ${
                selectedComplaint === complaint._id ? 'border-2 border-blue-500 shadow-md' : 'border-slate-200 hover:shadow-md'
              }`}
              onClick={() => setSelectedComplaint(selectedComplaint === complaint._id ? null : complaint._id)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left Origin Data */}
                <div className="space-y-3 relative">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{complaint.title || 'Untitled'}</h3>
                    <p className="text-xs font-bold text-slate-400 font-mono mt-1 pt-1">SYS_ID: {complaint._id.toUpperCase()}</p>
                    <p className="text-sm font-medium text-slate-600 mt-3 p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed whitespace-pre-wrap">
                      {complaint.description || 'No descriptive payload provided.'}
                    </p>
                  </div>
                </div>

                {/* Right Origin Data */}
                <div className="space-y-3 flex flex-col justify-start">
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      status={complaint.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(complaint.status)}
                    />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                       {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                       <Button variant="outline" size="sm" fullWidth className="font-bold text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors">
                         Open Configuration Panel
                       </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Explicit Expand Framework */}
              {selectedComplaint === complaint._id && (
                <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl" onClick={(e) => e.stopPropagation()}>
                   <div className="flex items-center justify-between flex-wrap gap-4">
                     
                     <div className="flex-1">
                       <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                         Machine Status Override
                       </label>
                       <select 
                         className="w-full sm:max-w-xs px-4 py-3 border border-slate-300 rounded-lg text-slate-700 font-bold focus:ring-2 focus:ring-blue-500 shadow-sm"
                         value={newStatusValues[complaint._id] || complaint.status}
                         onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                         disabled={complaint.status === 'resolved' || complaint.status === 'closed'}
                       >
                         <option value="assigned" disabled>Assigned</option>
                         <option value="in_progress">Shift to In Progress</option>
                         <option value="resolved">Mark as Resolved</option>
                       </select>
                     </div>

                     <div className="flex-1 flex justify-end">
                       <Button
                         variant="primary"
                         disabled={!newStatusValues[complaint._id] || newStatusValues[complaint._id] === complaint.status || (complaint.status === 'resolved')}
                         isLoading={updatingId === complaint._id}
                         onClick={(e) => { e.stopPropagation(); handleUpdateStatus(complaint._id); }}
                         className="py-3 px-8 font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-200"
                       >
                         Execute Status Mutate
                       </Button>
                     </div>

                   </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card variant="md" className="p-16 text-center shadow-none border border-slate-200 bg-slate-50">
            <div className="p-4 bg-white inline-block rounded-full mb-3 shadow-sm border border-slate-100"><CheckCircle2 className="w-8 h-8 text-green-500" /></div>
            <p className="text-slate-500 font-medium tracking-wide">No active nodes mapped to your profile.</p>
            <p className="text-slate-400 text-sm mt-1">Check back when the Department Head routes tickets.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignedComplaintsPage;
