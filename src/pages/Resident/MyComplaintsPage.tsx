import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, FileText, AlertCircle, TrendingUp, Filter } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';

// Direct Database synchronization 
import { useGetComplaintsQuery } from '@/features/complaint/complaint.api';

const MyComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // STEP 2: Strict RTK Query Integrations tracking Native Load/Error footprints
  const { data: response, isLoading, isError, error } = useGetComplaintsQuery();

  // STEP 6: Debugging Protocol (Logging Raw JSON Outputs seamlessly)
  console.log('[Resident/MyComplaints] Full Mongoose JSON Envelope:', response);

  // STEP 3: Fallback Data Mapping
  const complaints = response?.data || [];

  // Filter cleanly natively
  const filteredComplaints = complaints.filter((complaint: any) => {
    const titleMatch = (complaint.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = (complaint.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || categoryMatch;
    
    // Exact schema mapping
    const matchesFilter = filterStatus === 'all' || (complaint.status || '').toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Guard Clauses enforcing SAFE UI constraints sequentially
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
         <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
         <p className="text-slate-600 font-bold text-lg uppercase tracking-widest">Querying Express Backend...</p>
      </div>
    );
  }

  if (isError) {
    console.error('MyComplaints Data Exception:', error);
    return (
      <div className="p-12 text-center text-red-700 bg-red-50 border-2 border-red-200 rounded-2xl max-w-2xl mx-auto mt-12 shadow-sm">
         <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
         <h1 className="text-2xl font-black mb-2">Network Synchronization Blocked</h1>
         <p className="font-medium text-red-600 mb-6">The Redux store failed to securely fetch records from the Database Server layer.</p>
         <Button onClick={() => window.location.reload()} variant="outline" className="border-red-400 text-red-700 bg-white hover:bg-red-100">Attempt Reconnection</Button>
      </div>
    );
  }

  // Status Map enforcing highly precise stylistic tokens
  const getStatusMap = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'open':
      case 'pending': 
        return { label: 'Waiting', color: 'bg-zinc-100/80 text-zinc-600 border-zinc-200/60' };
      case 'assigned': 
        return { label: 'Assigned', color: 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60' };
      case 'in_progress': 
        return { label: 'In Progress', color: 'bg-amber-50/80 text-amber-700 border-amber-200/60' };
      case 'resolved': 
        return { label: 'Resolved', color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60' };
      case 'completed':
      case 'closed': 
        return { label: 'Completed', color: 'bg-teal-50/80 text-teal-700 border-teal-200/60' };
      default: 
        return { label: 'Waiting', color: 'bg-zinc-100/80 text-zinc-600 border-zinc-200/60' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Native Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">My Complaints</h1>
        <p className="text-zinc-500 font-medium mt-1">Track the status of your submitted issues</p>
      </div>

      {/* Interactive Network Search/Filter Module */}
      <Card variant="md" className="p-6 flex flex-col sm:flex-row gap-4 bg-zinc-50/50 border-dashed border-2 border-zinc-200/80">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search your complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm font-medium text-zinc-700"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none font-bold text-zinc-700"
          >
            <option value="all">All Complaints</option>
            <option value="open">Waiting</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Completed</option>
          </select>
        </div>
      </Card>

      {filteredComplaints.length === 0 ? (
        <Card variant="md" className="p-16 text-center border-dashed border-2 bg-zinc-50 border-zinc-200/80">
           <TrendingUp className="w-20 h-20 text-zinc-300 mx-auto mb-6" />
           <h2 className="text-2xl font-bold text-zinc-800 tracking-tight">No complaints found</h2>
           <p className="text-zinc-500 font-medium mt-2 max-w-sm mx-auto mb-8">
             Any issues you report will appear here.
           </p>
           <Button
             variant="primary"
             onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)}
             className="font-bold py-3 px-8 shadow-md hover:shadow-lg rounded-xl bg-indigo-600 hover:bg-indigo-700 tracking-wide text-[15px]"
           >
             Submit a Complaint
           </Button>
         </Card>
      ) : (
        <Card variant="md" className="overflow-hidden bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-zinc-100 rounded-[1.5rem] relative mb-8 animate-in fade-in duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Complaint ID</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Issue</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Department</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Date Filed</th>
                  <th className="py-5 px-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredComplaints.map((complaint: any) => {
                  const statusMap = getStatusMap(complaint.status || 'open');
                  return (
                    <tr 
                      key={complaint._id} 
                      className="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                    >
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                          #{complaint._id?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <p className="text-[15px] font-semibold text-zinc-800 line-clamp-1">{complaint.title || 'Untitled Case'}</p>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                        <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border ${statusMap.color}`}>
                          {statusMap.label}
                        </span>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                         <span className="text-[13px] font-medium text-zinc-500">
                           {complaint.departmentId?.name || 'Waiting for assignment'}
                         </span>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap">
                         <span className="text-[13px] font-medium text-zinc-500">
                           {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                         </span>
                      </td>
                      <td className="py-5 px-6 whitespace-nowrap text-right">
                        <button className="w-8 h-8 rounded-full bg-zinc-100/80 text-zinc-500 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all ml-auto shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5">
                           <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="py-4 px-6 bg-[#F8FAFC] border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
             <span>Total Records: {filteredComplaints.length}</span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MyComplaintsPage;
