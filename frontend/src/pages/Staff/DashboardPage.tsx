import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { getSLAStatus } from '@/utils/sla';
import { useGetStaffDashboardQuery } from '../../features/complaint/complaint.api';

const StaffDashboardPage: React.FC = () => {
  const { data: response, isLoading, isError, refetch } = useGetStaffDashboardQuery();
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
          <p className="text-sm opacity-80 mb-4">There was an error retrieving your assigned tickets.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, myComplaints } = response.data || {};

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getSLAStyle = (complaint: any) => {
    const status = getSLAStatus(complaint);
    if (status.type === 'neutral') return { label: status.label, style: 'bg-gray-100 text-gray-500' };
    if (status.type === 'danger') return { label: status.label, style: 'bg-red-100 text-red-700 border border-red-200' };
    if (status.type === 'warning') return { label: status.label, style: 'bg-amber-100 text-amber-700 border border-amber-200' };
    return { label: status.label, style: 'bg-emerald-50 text-emerald-700' };
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Workspace</h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">Manage your currently assigned tickets and deadlines.</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Assigned</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.totalAssigned || 0}</p>
        </div>
        <div className="bg-white border border-blue-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">In Progress</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.inProgress || 0}</p>
        </div>
        <div className="bg-white border border-emerald-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Resolved Today</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.resolvedToday || 0}</p>
        </div>
        <div className="bg-white border border-red-200/60 shadow-sm rounded-2xl p-6 relative overflow-hidden">
          <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">SLA At Risk</p>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">{stats?.slaAtRisk || 0}</p>
        </div>
      </div>

      {/* Assigned Complaints List */}
      <div className="bg-white border border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Assignments</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
            Last {myComplaints?.length || 0} Tickets
          </span>
        </div>
        
        {(!myComplaints || myComplaints.length === 0) ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-gray-300">✓</span>
            </div>
            <p className="text-gray-500 font-medium">Your queue is currently empty.</p>
            <p className="text-sm text-gray-400 mt-1">New assignments will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">SLA Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myComplaints.map((item: any) => {
                  const sla = getSLAStyle(item);
                  return (
                    <tr 
                      key={item._id} 
                      onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', item._id))}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 max-w-[250px] truncate group-hover:text-indigo-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">#{item._id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          item.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                          item.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest ${
                          item.priority === 'critical' ? 'text-red-600 bg-red-50 px-2 py-1 rounded' :
                          item.priority === 'high' ? 'text-amber-600 bg-amber-50 px-2 py-1 rounded' :
                          item.priority === 'medium' ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded' : 'text-gray-600 bg-gray-50 px-2 py-1 rounded'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="text-sm font-medium text-gray-700">
                            {formatDate(item.slaDeadline)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${sla.style}`}>
                            {sla.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StaffDashboardPage;
