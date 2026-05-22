import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetComplaintsQuery } from '../../features/complaint/complaint.api';
import { ROUTES } from '../../constants';

const STATUS_STAGES = [
  { key: 'pending_assignment', label: 'Submitted' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' }
];

const DashboardPage: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetComplaintsQuery();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 animate-pulse rounded-2xl mt-8"></div>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-red-500 bg-red-50 p-6 rounded-xl text-center max-w-md border border-red-100">
          <h3 className="text-lg font-bold mb-2">Failed to load dashboard</h3>
          <p className="text-sm opacity-80 mb-4">There was an error retrieving your complaints.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const complaints = response.data || [];

  // Compute Stats
  const stats = complaints.reduce(
    (acc: any, curr: any) => {
      acc.total += 1;
      
      const isActive = ['pending', 'pending_assignment', 'assigned', 'in_progress'].includes(curr.status);
      if (isActive) acc.active += 1;
      
      if (curr.status === 'resolved' || curr.status === 'closed') acc.resolved += 1;
      
      if (curr.slaBreached) acc.slaBreached += 1;
      
      return acc;
    },
    { total: 0, active: 0, resolved: 0, slaBreached: 0 }
  );

  const getSLAStatus = (complaint: any) => {
    if (complaint.status === 'resolved' || complaint.status === 'closed') {
      return { label: 'Completed', color: 'text-gray-500', bg: 'bg-gray-100' };
    }
    
    if (complaint.slaBreached) {
      return { label: 'Breached', color: 'text-red-700', bg: 'bg-red-100 border border-red-200' };
    }

    const now = new Date();
    const deadline = new Date(complaint.slaDeadline);
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursLeft <= 2 && hoursLeft > 0) {
      return { label: 'Near Deadline', color: 'text-amber-700', bg: 'bg-amber-100 border border-amber-200' };
    }

    return { label: 'On Track', color: 'text-emerald-700', bg: 'bg-emerald-50' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getProgressIndex = (status: string) => {
    // Treat 'pending' the same as 'pending_assignment'
    const s = status === 'pending' ? 'pending_assignment' : status;
    const index = STATUS_STAGES.findIndex(stage => stage.key === s);
    return index === -1 ? 0 : index;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resident Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Track your community requests and issues.</p>
        </div>
        <button 
          onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
        >
          + New Complaint
        </button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total}</p>
        </div>
        <div className="bg-white border border-blue-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Active</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.active}</p>
        </div>
        <div className="bg-white border border-emerald-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Resolved</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.resolved}</p>
        </div>
        <div className="bg-white border border-red-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">SLA Breached</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats.slaBreached}</p>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-4">My Complaints</h2>
        
        {complaints.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center text-gray-500 font-medium">
            You haven't submitted any complaints yet.
          </div>
        ) : (
          complaints.map((complaint: any) => {
            const sla = getSLAStatus(complaint);
            const currentStageIndex = getProgressIndex(complaint.status);

            return (
              <div 
                key={complaint._id}
                onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 rounded-2xl p-6 cursor-pointer transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{complaint.title}</h3>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                        complaint.priority === 'critical' ? 'text-red-700 bg-red-100' :
                        complaint.priority === 'high' ? 'text-amber-700 bg-amber-100' :
                        complaint.priority === 'medium' ? 'text-indigo-700 bg-indigo-100' : 'text-gray-700 bg-gray-100'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                      <span>ID: #{complaint._id.slice(-6).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{formatDate(complaint.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Deadline</p>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm font-semibold text-gray-700">{formatDate(complaint.slaDeadline)}</span>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${sla.bg} ${sla.color}`}>
                        {sla.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative pt-2 pb-1">
                  <div className="overflow-hidden h-1.5 flex rounded-full bg-gray-100 mb-2">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        complaint.status === 'resolved' || complaint.status === 'closed' ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(5, (currentStageIndex / (STATUS_STAGES.length - 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {STATUS_STAGES.map((stage, idx) => (
                      <span 
                        key={stage.key} 
                        className={`text-center ${idx <= currentStageIndex ? 'text-indigo-600' : ''}`}
                      >
                        {stage.label}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default DashboardPage;
