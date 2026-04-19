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

  return (
    <div className="space-y-6">
      {/* Dynamic Native Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Complaint Log</h1>
        <p className="text-slate-500 font-medium mt-1">Real-time trace of your personal facility impact issues</p>
      </div>

      {/* Interactive Network Search/Filter Module */}
      <Card variant="md" className="p-6 flex flex-col sm:flex-row gap-4 bg-slate-50 border-dashed border-2 border-slate-200">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search database dynamically..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none font-bold text-slate-700"
          >
            <option value="all">Unified Status Log</option>
            <option value="open">Open (Unassigned)</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Archived Closed</option>
          </select>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2">
        <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">
          Filtered Extrapolations: {filteredComplaints.length} Node(s)
        </p>
      </div>

      {/* Strict UI Handling: Empty Guard */}
      {filteredComplaints.length === 0 ? (
        <Card variant="md" className="p-16 text-center border-dashed border-2 bg-slate-50">
          <TrendingUp className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No complaints found</h2>
          <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto mb-8">
            Database constraints returned exactly 0 records matching your query block.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)}
            className="font-bold py-3 px-8 shadow-md hover:shadow-lg"
          >
            Generate Initial Complaint
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint: any) => (
            <Card
              key={complaint._id}
              variant="md"
              className="p-6 hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-blue-100 group"
              onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight group-hover:text-blue-700 transition-colors">
                    {complaint.title || 'Untitled Case'}
                  </h3>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                       Assigned to {complaint.departmentId?.name || 'Pending Selection'} • Priority: {complaint.priority || 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      ID: ...{complaint._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {/* Safely evaluating unmapped backend string */}
                  <span className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl border
                    ${complaint.status === 'open' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      complaint.status === 'resolved' || complaint.status === 'completed' || complaint.status === 'closed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'}
                  `}>
                    {complaint.status || 'UNKNOWN'}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:border-transparent">
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaintsPage;
