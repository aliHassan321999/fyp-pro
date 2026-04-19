import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useAuth } from '@hooks/useAuth';
import { useGetComplaintsQuery } from '@/features/complaint/complaint.api';

const ResidentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Safe UI: RTK Query fetching directly triggers React loader hooks natively
  const { data: response, isLoading, isError, error } = useGetComplaintsQuery();

  // Step 6 Debug: Observe completely unaltered payload to guarantee validation map
  console.log('[ResidentDashboard Debug] Complaints HTTP Response:', response);
  console.log('[ResidentDashboard Debug] Auth User Metadata:', user);

  // Step 3 Data Mapping: Strictly unpacking JSON envelope
  const complaints = response?.data || [];
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4 tracking-widest"></div>
          <p className="text-blue-600 font-bold text-xl uppercase">Synchronizing Portal...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error('[ResidentDashboard Error Alert] Failed API Handshake:', error);
    return (
      <div className="p-8 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h3 className="font-bold text-lg mb-2">Failed to Sync Database Statistics</h3>
        <p>Please check the Browser Network tab for CORS or HttpOnly cookie assignment issues.</p>
        <Button variant="outline" className="mt-4 border-red-500 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>Re-Establish Handshake</Button>
      </div>
    );
  }

  // Derive computations safely mapped across real schema conditions
  const totalComplaints = complaints.length;
  const pendingComplaints = complaints.filter((c: any) => ['open', 'pending', 'assigned'].includes(c.status?.toLowerCase())).length;
  const resolvedComplaints = complaints.filter((c: any) => ['resolved', 'closed', 'completed'].includes(c.status?.toLowerCase())).length;
  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome back, {user?.profile?.fullName || user?.email || 'Resident'}! 👋</h1>
            <p className="text-blue-100 text-base font-medium">Here's your live digital estate overview synced directly with the server.</p>
            <p className="text-blue-50 text-sm mt-3 flex items-center gap-1 font-bold">
              <MapPinIcon /> {user?.profile?.address?.block || 'Identity Verified Area Address'}
            </p>
          </div>
          <Button 
            variant="outline" 
            className="mt-6 sm:mt-0 bg-white/10 hover:bg-white/20 text-white border-white border justify-center rounded-xl p-6" 
            onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)}
          >
            <Plus className="w-6 h-6 mr-2 font-bold" />
            Lodge Complaint
          </Button>
        </div>
      </div>

      {/* Analytics KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Metric Node */}
        <div className="group cursor-pointer" onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}>
          <Card variant="md" className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-l-8 border-blue-600 bg-white shadow-sm hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-blue-600 border border-blue-100">
                    <FileText className="w-7 h-7" />
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Network Tickets</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalComplaints}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Node */}
        <div className="group cursor-pointer" onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}>
          <Card variant="md" className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-l-8 border-yellow-500 bg-white shadow-sm hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all text-yellow-600 border border-yellow-100">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Active Pipeline</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{pendingComplaints}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Resolution Metric */}
        <div className="group">
          <Card variant="md" className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-l-8 border-green-500 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-100">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-md">
                    {resolutionRate}% YIELD
                  </span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Engineered Resolutions</p>
                <p className="text-5xl font-black text-slate-900 tracking-tighter">{resolvedComplaints}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card variant="md" className="p-8 border-t-[6px] border-t-slate-800 rounded-t-xl overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
              <Clock className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recent Registry Transactions</h2>
              <p className="text-slate-500 text-sm font-medium mt-1">Live synchronicity overview matching SLA endpoints directly</p>
            </div>
          </div>
          <button 
            onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}
            className="text-blue-600 text-sm font-bold hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-md transition-colors border border-blue-100"
          >
            Access Full Logs →
          </button>
        </div>

        {/* Dynamic Safe List Render */}
        <div className="space-y-4">
          {complaints.length === 0 ? (
             <div className="p-10 text-center flex flex-col items-center text-slate-500 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
               <TrendingUp className="w-16 h-16 text-slate-300 mb-4" />
               <p className="font-bold text-lg text-slate-700">Database Empty</p>
               <p className="font-medium text-sm mt-1 mb-6">No records detected flowing through the Mongoose backend schema yet.</p>
               <Button onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)} variant="primary">Initialize First Complaint</Button>
             </div>
          ) : (
            complaints.slice(0, 5).map((complaint: any) => {
              // Dynamic CSS property pipeline mapping raw DB output dynamically into UX variables
              const isActive = complaint.status !== 'resolved' && complaint.status !== 'closed' && complaint.status !== 'completed';
              
              const statusBox = isActive 
                ? { bg: 'bg-yellow-50', border: 'border-yellow-200 text-yellow-900', ring: 'ring-yellow-400', icon: '⏱️' }
                : { bg: 'bg-green-50', border: 'border-green-200 text-green-900', ring: 'ring-green-400', icon: '✅' };

              return (
                <div 
                  key={complaint._id}
                  onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                  className={`p-5 rounded-xl cursor-pointer transition-all hover:shadow-lg ${statusBox.bg} border-2 ${statusBox.border} relative group`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-slate-400 rounded-l-xl transition-all`}></div>
                  <div className="flex items-start justify-between pl-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xl bg-white p-2 rounded-lg shadow-sm">{statusBox.icon}</span>
                        <h3 className="font-bold text-lg text-slate-900 tracking-tight">{complaint.title}</h3>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm font-bold text-slate-600">
                        <span className="flex items-center gap-1 opacity-80"><FileText className="w-4 h-4 text-blue-500"/> 
                           Assigned to {complaint.departmentId?.name || 'Pending Output'} • Priority: {complaint.priority?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className="flex items-center gap-1 opacity-60"><Clock className="w-4 h-4"/> 
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-sm whitespace-nowrap ml-4 bg-white ${statusBox.border}`}>
                      {complaint.status || 'UNASSIGNED'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};

// SVG Placeholder map explicitly to prevent implicit prop-drilling errors missing standard lucide packages organically
const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

export default ResidentDashboard;
