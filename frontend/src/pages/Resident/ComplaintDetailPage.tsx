import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Check, FileText, Plus, X, Star } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
// @ts-ignore
import { useGetComplaintDetailsQuery } from '@/features/complaint/complaint.api';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import StaffActionPanel from '../../components/complaints/StaffActionPanel';
import { useAuth } from '@hooks/useAuth';
import { getSLAStatus } from '@/utils/sla';

const ComplaintDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const feedbackSectionRef = useRef<HTMLDivElement>(null);

  const { data: detailsData, isLoading: isDetailsLoading, isError: isDetailsError, refetch } = useGetComplaintDetailsQuery(id as string, { skip: !id });
  
  const complaint = detailsData?.data;

  const getPriorityConfig = (priority: string = '') => {
    switch(priority.toLowerCase()) {
      case 'critical': return { color: 'text-rose-600', bg: 'bg-rose-50/50', icon: <AlertTriangle className="w-5 h-5 text-rose-500" />, label: 'CRITICAL' };
      case 'high': return { color: 'text-amber-600', bg: 'bg-amber-50/50', icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, label: 'HIGH' };
      case 'medium': return { color: 'text-indigo-600', bg: 'bg-indigo-50/50', icon: <Clock className="w-5 h-5 text-indigo-500" />, label: 'MEDIUM' };
      case 'low': 
      default: return { color: 'text-zinc-600', bg: 'bg-zinc-50/50', icon: <CheckCircle className="w-5 h-5 text-zinc-500" />, label: 'STANDARD' };
    }
  };

  const priorityConfig = getPriorityConfig(complaint?.priority);

  const getSLAConfig = (complaint: any) => {
    if (!complaint?.slaDeadline) return null;
    const status = getSLAStatus(complaint);
    if (status.type === 'neutral') return null;

    if (status.type === 'danger') return { label: 'OVERDUE', color: 'text-red-700', bg: 'bg-red-100 ring-red-200' };
    if (status.type === 'warning') return { label: 'DUE SOON', color: 'text-amber-700', bg: 'bg-amber-100 ring-amber-200' };
    return { label: 'ON TRACK', color: 'text-emerald-700', bg: 'bg-emerald-50 ring-emerald-100' };
  };

  const slaConfig = getSLAConfig(complaint);
  const assignedStaff = complaint?.assignedStaffId;
  const assignedStaffId = typeof assignedStaff === 'string' ? assignedStaff : (assignedStaff as any)?._id;
  const isAssignedStaff = user?.role === 'staff' && assignedStaffId === user?._id;

  // Status mapping for pipeline
  const getTimelineStepStatus = (stepId: number, currentStatus: string) => {
    const statuses = ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus?.toLowerCase() || 'open');
    let targetIndex = 0;
    
    if (stepId === 1) targetIndex = 0; // Submitted
    if (stepId === 2) targetIndex = 1; // Assigned
    if (stepId === 3) targetIndex = 2; // In Progress
    if (stepId === 4) targetIndex = 3; // Resolved

    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'current';
    return 'pending';
  };

  const isCompleted = ['resolved', 'closed', 'completed'].includes(complaint?.status?.toLowerCase() ?? '');

  useEffect(() => {
    if (location.state?.feedbackSuccess && feedbackSectionRef.current) {
       setTimeout(() => {
         feedbackSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         // Clear location state securely
         window.history.replaceState({}, document.title);
       }, 500);
    }
  }, [location.state?.feedbackSuccess]);

  if (isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Loading Record...</p>
      </div>
    );
  }

  if (isDetailsError || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load record</h3>
        <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Visual Header */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white border border-zinc-200 text-zinc-600 flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
          Complaint Details
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] ${
            ['resolved', 'closed', 'completed'].includes(complaint.status?.toLowerCase()) ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/50'
          }`}>
            {complaint.status?.replace('_', ' ')}
          </span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (70%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Title & Meta */}
          <Card variant="lg" className="p-8 border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
            <h2 className="text-3xl leading-tight font-bold text-zinc-900 mb-3">{complaint.title || 'Untitled Report'}</h2>
            <p className="text-zinc-500 font-medium flex items-center gap-2 mb-8">
               <span className="font-semibold text-zinc-700 tracking-wide">Ticket ID: <span className="text-indigo-600">#{complaint._id?.slice(-6).toUpperCase()}</span></span>
               <span className="opacity-50 text-zinc-300">•</span>
               <span>Submitted {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </p>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-zinc-50/80 border border-zinc-200/50 p-4 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Category</p>
                  <p className="font-semibold text-zinc-800">{complaint.category || 'General Issue'}</p>
               </div>
               <div className="bg-zinc-50/80 border border-zinc-200/50 p-4 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Department</p>
                  <p className="font-semibold text-zinc-800">{complaint.departmentId?.name || 'Waiting for assignment'}</p>
               </div>
               <div className="bg-zinc-50/80 border border-zinc-200/50 p-4 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Time</p>
                  <p className="font-semibold text-zinc-800">{new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
            </div>
          </Card>

          {/* Description & Extracted Media */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2"><FileText className="w-3.5 h-3.5"/> Incident Description</h3>
             <Card variant="md" className="p-8 border border-slate-200/60 shadow-sm rounded-2xl">
               <p className="text-slate-700 text-base leading-relaxed tracking-wide font-medium mb-8">
                 {complaint.description || 'No detailed description provided by the resident.'}
               </p>

               {/* Responsive Image Grid mapped explicitly */}
               {complaint.attachedImages && complaint.attachedImages.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-8">
                   {complaint.attachedImages.map((img: string, idx: number) => (
                     <div 
                       key={idx} 
                       onClick={() => setPreviewImage(img)}
                       className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer group relative bg-slate-50"
                     >
                       <img src={img} alt="Complaint file" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                          <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-300" />
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </Card>
          </div>

          {/* Feedback CTA Injection Node */}
          <div ref={feedbackSectionRef}>
             {isCompleted && !complaint.feedbackSubmitted && (
               <Card variant="md" className="p-8 border border-indigo-200/60 shadow-lg shadow-indigo-900/5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white relative overflow-hidden group mt-6">
                  <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110 duration-500">
                    <Star className="w-32 h-32 text-indigo-600 fill-indigo-600" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-indigo-950 tracking-tight mb-1">Your issue has been resolved</h3>
                      <p className="text-indigo-700/80 font-medium">How was your experience?</p>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={() => navigate(ROUTES.RESIDENT_FEEDBACK.replace(':id', complaint._id))}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold px-8 py-3 rounded-xl whitespace-nowrap"
                    >
                      Rate & Give Feedback
                    </Button>
                  </div>
               </Card>
             )}

             {isCompleted && complaint.feedbackSubmitted && (
                <Card variant="md" className="p-5 bg-emerald-50/80 border border-emerald-200/60 rounded-xl shadow-sm text-center mt-6">
                   <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
                      <CheckCircle className="w-5 h-5 fill-emerald-100" />
                      <span className="font-bold tracking-wide">Feedback Recorded</span>
                   </div>
                   <p className="text-sm font-medium text-emerald-700/80">Thank you for your feedback! Your voice helps improve our community standards.</p>
                </Card>
             )}
          </div>

        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* High-Contrast Priority Module */}
           <Card variant="md" className={`${priorityConfig.bg} border-2 border-transparent p-6 rounded-2xl`}>
              <div className="flex items-start justify-between">
                 <div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 opacity-70">Priority Status</p>
                   <p className={`text-2xl font-bold ${priorityConfig.color} flex items-center gap-2 tracking-tight`}>
                      {priorityConfig.icon}
                      {priorityConfig.label}
                   </p>
                 </div>
              </div>
           </Card>

           {/* SLA Awareness Module */}
           {slaConfig && (
             <Card variant="md" className={`${slaConfig.bg} ring-1 p-6 rounded-2xl mt-4`}>
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 opacity-70">SLA Deadline</p>
                  <p className="text-sm font-bold text-slate-800 mb-2">
                    {new Date(complaint.slaDeadline as string).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest self-start ${slaConfig.color} bg-white/50 backdrop-blur-sm`}>
                    {slaConfig.label}
                  </span>
                </div>
             </Card>
           )}
           
           {/* Staff Action Panel */}
           <StaffActionPanel 
             complaintId={complaint._id} 
             currentStatus={complaint.status} 
             isAssignedStaff={isAssignedStaff} 
             onSuccess={() => refetch()} 
           />
           
           {/* Standard Clean Timeline UI */}
           <div className="pt-2">
             <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] ml-2 mb-4">Progress Roadmap</h3>
             <Card variant="md" className="p-8 border border-zinc-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl bg-white">
               <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-zinc-100">
                 
                 {[
                   { id: 1, title: 'Complaint Submitted', desc: 'System received record.' },
                   { id: 2, title: 'Assigned', desc: 'Department personnel routed.' },
                   { id: 3, title: 'In Progress', desc: 'Active execution initiated.' },
                   { id: 4, title: 'Resolved', desc: 'Case marked complete.' }
                 ].map((step) => {
                   const stepState = getTimelineStepStatus(step.id, complaint.status);
                   return (
                     <div key={step.id} className="relative flex gap-5 items-start">
                       <div className="shrink-0 relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-[3px] bg-white border-white shadow-sm ring-1 ring-zinc-200">
                          {stepState === 'completed' && <div className="w-full h-full bg-indigo-500 rounded-full flex items-center justify-center text-white"><Check className="w-4 h-4"/></div>}
                          {stepState === 'current' && <div className="w-full h-full bg-indigo-50 rounded-full border-2 border-indigo-500"></div>}
                          {stepState === 'pending' && <div className="w-full h-full bg-zinc-50 rounded-full"></div>}
                       </div>
                       <div className={`pt-1.5 transition-opacity ${stepState === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                         <h4 className={`text-sm font-semibold ${stepState === 'pending' ? 'text-zinc-500' : 'text-zinc-900'} tracking-tight`}>{step.title}</h4>
                         <p className="text-xs font-medium text-zinc-500 mt-1">{step.desc}</p>
                       </div>
                     </div>
                   );
                 })}

               </div>
             </Card>
           </div>

           {/* Dynamic Activity Timeline */}
           <div className="pt-2">
             <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] ml-2 mb-4">Activity Log</h3>
             <ComplaintTimeline complaintId={complaint._id} />
           </div>

        </div>

      </div>

      {/* Dynamic Image Overlay Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-5xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <img src={previewImage} alt="Expanded record" className="w-auto h-auto max-h-[85vh] max-w-full rounded-2xl shadow-2xl border border-white/10" />
             <button title="Close" onClick={() => setPreviewImage(null)} className="absolute -top-6 -right-6 w-12 h-12 bg-white text-slate-800 rounded-full shadow-xl flex items-center justify-center hover:bg-slate-100 hover:scale-110 transition-all font-bold">
               <X className="w-5 h-5"/>
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ComplaintDetailPage;
