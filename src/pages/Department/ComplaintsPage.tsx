import React, { useState } from 'react';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useGetComplaintsQuery, useGetStaffQuery, useAssignComplaintMutation } from '@/features/complaint/complaint.api';
import { showSuccess, showError } from '@/utils/toast';

const DepartmentComplaintsPage: React.FC = () => {
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
        return 'bg-indigo-100';
      case 'open':
      case 'pending':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
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
      const complaintMatch = complaints.find(c => c._id === complaintId);
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
        <p className="text-slate-500 font-medium tracking-wide">Syncing Department Nodes...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Network Error</h3>
        <p className="text-slate-500 text-center max-w-md">
          {((error as any)?.data?.message) || "Unable to route department aggregates. Please verify connection."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Department Dashboard</h1>
        <p className="text-slate-600 mt-2 font-medium">
          Managing {filteredComplaints.length} active ticket arrays
        </p>
      </div>

      {/* Constraints Mapping */}
      <Card variant="md" className="p-6 shadow-sm border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              placeholder="Search by title node..."
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
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Ticket Interface */}
      <Card variant="md" className="p-6 overflow-x-auto shadow-sm border-slate-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest rounded-tl-xl">Target Node</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">SLA Priority</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Status Flow</th>
              <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest rounded-tr-xl">Action Route</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map((complaint) => (
              <tr key={complaint._id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-5">
                  <div className="max-w-md">
                    <p className="font-bold text-slate-900 truncate tracking-tight">{complaint.title || 'Untitled Node'}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1 truncate">ID: {complaint._id.toUpperCase()}</p>
                  </div>
                </td>
                <td className="px-5 py-5">
                   <span className={`text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded-md ${complaint.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'}`}>
                     {complaint.priority || 'NORMAL'}
                   </span>
                </td>
                <td className="px-5 py-5">
                  <StatusBadge
                    status={complaint.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(complaint.status)}
                  />
                  {complaint.status === 'assigned' && (
                    <p className="text-xs text-indigo-600 font-bold mt-1.5 flex items-center gap-1">✔ Staff Allocated</p>
                  )}
                </td>
                <td className="px-5 py-5">
                  {complaint.status === 'open' || complaint.status === 'assigned' ? (
                     <div className="flex gap-2 items-center flex-wrap">
                        {isStaffLoading ? (
                          <span className="text-xs font-bold text-slate-400">Loading Staff...</span>
                        ) : staffMembers.length > 0 ? (
                           <select 
                             className="text-sm px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-blue-500"
                             value={selectedStaffIds[complaint._id] || ''}
                             onChange={(e) => handleStaffSelect(complaint._id, e.target.value)}
                           >
                             <option value="" disabled>Select Staff</option>
                             {staffMembers.map(staff => (
                               <option key={staff._id} value={staff._id}>{staff.name}</option>
                             ))}
                           </select>
                        ) : (
                           <span className="text-xs font-bold text-red-500">No Staff Available</span>
                        )}
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleAssign(complaint._id)}
                          isLoading={assigningId === complaint._id}
                          disabled={!selectedStaffIds[complaint._id] || assigningId !== null}
                          className="font-bold shadow-sm"
                        >
                          {complaint.status === 'assigned' ? 'Reassign' : 'Assign Node'}
                        </Button>
                     </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Locked</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredComplaints.length === 0 && (
          <div className="py-16 text-center">
            <div className="p-4 bg-slate-100 inline-block rounded-full mb-3 shadow-inner"><AlertCircle className="w-6 h-6 text-slate-400" /></div>
            <p className="text-slate-500 font-medium tracking-wide">No active nodes populate this filter query.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DepartmentComplaintsPage;
