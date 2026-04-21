import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, CheckCircle, Clock, FileText, TrendingUp, MapPin, ChevronRight, Activity } from 'lucide-react';
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in">
      {/* Premium Welcome Header (Scaled Down natively) */}
      <div className="relative overflow-hidden rounded-[1.5rem] bg-[#0f172a] shadow-xl shadow-blue-900/10 border border-slate-800 p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/20 backdrop-blur-3xl"></div>
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 w-full">
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
              <Activity className="w-3.5 h-3.5" /> Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">{user?.profile?.fullName?.split(' ')[0] || 'Resident'}</span> 👋
            </h1>
            <p className="text-slate-300 text-sm max-w-lg font-medium leading-relaxed">
              Submit complaints, track progress, and get updates in real time.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)}
              className="group relative inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all duration-300 bg-blue-600 rounded-xl hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 overflow-hidden w-full md:w-auto"
            >
              <div className="absolute inset-0 w-full h-full -ml-10 bg-white/20 translate-x-[-100%] skew-x-12 group-hover:translate-x-[200%] transition-transform duration-700 ease-out"></div>
              <Plus className="w-4 h-4 mr-2" />
              New Complaint
            </button>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit self-start md:self-end">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {user?.profile?.address?.block ? `BLK ${user.profile.address.block}, H-${user.profile.address.houseNumber}` : 'Verified'}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats (Compact Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<FileText className="w-5 h-5 text-indigo-600" />} 
          label="Total Complaints" 
          value={totalComplaints} 
          onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)} 
          borderColor="border-indigo-100/60"
          bgHover="hover:bg-indigo-50/40"
          iconBg="bg-indigo-50"
        />
        <StatCard 
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />} 
          label="In Progress" 
          value={pendingComplaints} 
          onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)} 
          borderColor="border-amber-100/60"
          bgHover="hover:bg-amber-50/40"
          iconBg="bg-amber-50"
        />
        <StatCard 
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} 
          label="Resolved" 
          value={resolvedComplaints} 
          onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)} 
          borderColor="border-emerald-100/60"
          bgHover="hover:bg-emerald-50/40"
          iconBg="bg-emerald-50"
          badge={`${resolutionRate}%`}
        />
      </div>

      {/* Recent Complaints Minimal List Layout */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" /> Recent Activity
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Your latest submitted requests and timeline updates</p>
          </div>
          <button 
            onClick={() => navigate(ROUTES.RESIDENT_MY_COMPLAINTS)}
            className="group flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl border border-indigo-100"
          >
            View All History <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="space-y-4">
          {complaints.length === 0 ? (
             <div className="py-16 text-center flex flex-col items-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
               <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                 <FileText className="w-10 h-10 text-slate-300" />
               </div>
               <p className="font-bold text-xl text-slate-700 tracking-tight">No requests found</p>
               <p className="font-medium text-slate-400 mt-2 mb-8 max-w-sm leading-relaxed">Your digital ecosystem is completely clear. Any issues you report will natively appear here.</p>
               <Button onClick={() => navigate(ROUTES.RESIDENT_SUBMIT_COMPLAINT)} className="rounded-xl px-6 h-12 text-base shadow-md">Initialize First Request</Button>
             </div>
          ) : (
            complaints.slice(0, 5).map((complaint: any) => {
              const isActive = !['resolved', 'closed', 'completed'].includes(complaint.status?.toLowerCase());
              
              return (
                <div 
                  key={complaint._id}
                  onClick={() => navigate(ROUTES.RESIDENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer gap-4 relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-indigo-500 transition-colors"></div>
                  
                  <div className="flex items-start gap-4">
                    <div className={`mt-1.5 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isActive ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'} transition-transform group-hover:scale-105`}>
                      {isActive ? <AlertCircle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-[17px] tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{complaint.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[13px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                           {complaint.departmentId?.name || 'Pending Routing'}
                        </span>
                        <span className="flex items-center gap-1.5 opacity-80">
                          {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0">
                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm
                      ${isActive 
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      }`}
                    >
                      {complaint.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-slate-300 ml-4 group-hover:text-indigo-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, onClick, borderColor, bgHover, iconBg, badge }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-6 border ${borderColor} shadow-sm cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${bgHover} relative overflow-hidden`}
  >
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${iconBg} shadow-inner`}>
        {icon}
      </div>
      {badge && (
        <span className="bg-emerald-100/80 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
          {badge}
        </span>
      )}
    </div>
    <div className="relative z-10">
      <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h4>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1.5 opacity-80">{label}</p>
    </div>
  </div>
);

export default ResidentDashboard;
