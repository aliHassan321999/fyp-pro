import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Clock, User, MapPin, Tag, Star, Loader2, AlertCircle, Plus, UserCheck, RefreshCw } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useGetComplaintDetailsQuery, useGetComplaintActivityQuery } from '@/features/complaint/complaint.api';

const ComplaintDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Secure mapped data bindings directly from Express payload
  const { data: detailsData, isLoading: isDetailsLoading, isError: isDetailsError } = useGetComplaintDetailsQuery(id as string, { skip: !id });
  const { data: activityData, isLoading: isActivityLoading } = useGetComplaintActivityQuery(id as string, { skip: !id });

  const complaint = detailsData?.data;
  const activities = activityData?.data || [];

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

  const getActionPhrase = (action: string, oldValue?: string, newValue?: string, performerName?: string) => {
    switch (action) {
       case 'created':
         return "Complaint created";
       case 'assigned':
       case 'staff_assigned':
         {
           // Secure extraction from detailed master node payload
           const assignedName = typeof complaint?.assignedStaffId === 'object' 
              ? (complaint?.assignedStaffId?.profile?.fullName || complaint?.assignedStaffId?.email) 
              : 'Staff Member';
           return `Assigned to ${assignedName} by ${performerName || 'System'}`;
         }
       case 'status_updated':
         {
           const oldStr = oldValue ? oldValue.replace('_', ' ').toUpperCase() : 'OPEN';
           const newStr = newValue ? newValue.replace('_', ' ').toUpperCase() : 'UNKNOWN';
           return `Status changed from ${oldStr} → ${newStr}`;
         }
       default:
         return action.replace('_', ' ').toUpperCase();
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check Date Nodes dynamically
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `${timeStr} • Today`;
    if (isYesterday) return `Yesterday • ${timeStr}`;
    return `${date.toLocaleDateString()} • ${timeStr}`;
  };

  const getActionIcon = (action: string) => {
    if (action === 'created') return <Plus className="w-5 h-5 text-white" strokeWidth={3} />;
    if (action.includes('assign')) return <UserCheck className="w-5 h-5 text-white" strokeWidth={2.5}/>;
    if (action.includes('status')) return <RefreshCw className="w-5 h-5 text-white" strokeWidth={2.5}/>;
    return <span className="w-2.5 h-2.5 bg-white rounded-full"></span>;
  };

  if (isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Mapping Sequence Matrix...</p>
      </div>
    );
  }

  if (isDetailsError || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Query Failure</h3>
        <p className="text-slate-500 max-w-sm text-center">
          The explicit tracking payload could not be extracted. Verity uplink parameters.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => navigate(-1)}>Return to Registry</Button>
      </div>
    );
  }

  const isCompleted = complaint.status === 'resolved' || complaint.status === 'closed';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Dynamic Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="p-2 border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{complaint.title || 'Untitled Report'}</h1>
      </div>

      {/* Target Status Bar */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/50 border border-slate-200/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Current Machine State</p>
            <StatusBadge
              status={complaint.status.replace('_', ' ').toUpperCase()}
              color={getStatusColor(complaint.status)}
            />
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">SLA Deadline Constraint</p>
            <p className="font-bold text-slate-800 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block shadow-sm">
              {complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : 'Inherited Route'}
            </p>
          </div>
        </div>
      </Card>

      {/* Primary Extracted Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Payload Details */}
        <Card variant="md" className="p-6 shadow-sm border border-slate-200/60 h-full">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            Payload Properties
          </h3>
          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descriptive Profile</p>
              <p className="text-slate-800 leading-relaxed font-medium">
                 {complaint.description || 'No exact parameters provided in chunk.'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Location</p>
                 <p className="text-slate-900 font-bold ml-4">{complaint.locationText || 'Standard Map'}</p>
               </div>
               <div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Generation Date</p>
                 <p className="text-slate-900 font-bold ml-4">
                   {new Date(complaint.createdAt).toLocaleDateString()}
                 </p>
               </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Assignment Configuration */}
        <Card variant="md" className="p-6 shadow-sm border border-slate-200/60 h-full flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Allocation Node
          </h3>
          <div className="space-y-6 flex-1">
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Target Department Map</p>
              <p className="text-indigo-900 font-black text-lg">
                 {typeof complaint.departmentId === 'object' ? complaint.departmentId?.name : 'Pending Output'}
              </p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Support Staff</p>
              <p className="text-slate-900 font-bold">
                 {typeof complaint.assignedStaffId === 'object' ? complaint.assignedStaffId?.profile?.fullName || complaint.assignedStaffId?.email : 'Unassigned in Pipeline'}
              </p>
            </div>
          </div>
          
          <div className="pt-6 mt-4 border-t border-slate-100">
            <Button
              variant="outline"
              fullWidth
              disabled={complaint.status === 'open'}
              className="flex items-center justify-center gap-2 font-bold text-slate-600 border-slate-200 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              {complaint.status === 'open' ? 'Comm-Link Offline' : 'Contact Assigned Staff'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Server Derived Chronological Timeline Block */}
      <Card variant="md" className="p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
        <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Timeline & Activity Log</h3>
        
        {isActivityLoading ? (
           <div className="py-8 flex text-slate-400 text-sm font-bold items-center gap-3"><Loader2 className="w-4 h-4 animate-spin"/> Mining DB Activity Array...</div>
        ) : activities.length === 0 ? (
           <div className="py-8 text-slate-500 font-medium bg-slate-50 rounded-xl px-6 flex items-center border border-slate-100 gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              No activity yet. Updates will appear here.
           </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {activities.map((update, index) => {
              const performerName = update.performedBy?.profile?.fullName || update.performedBy?.email || 'System';
              const actionContent = getActionPhrase(update.action, update.oldValue, update.newValue, performerName);

              return (
                <div key={update._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Badge Icons */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                     update.action === 'created' ? 'bg-indigo-500' :
                     update.action.includes('status') ? 'bg-orange-400' :
                     'bg-blue-500'
                  }`}>
                     {getActionIcon(update.action)}
                  </div>
                  
                  {/* Content Container */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                    {/* Timestamp Tag */}
                    <div className="absolute right-4 top-4">
                       <span className="text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">
                         {formatTimestamp(update.createdAt)}
                       </span>
                    </div>
                    
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                       <Clock className="w-3 h-3"/> Operation Mapped
                    </p>
                    
                    <p className="text-slate-800 font-black text-[15px] mb-1 pr-24 leading-snug">{actionContent}</p>
                    
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
                       <User className="w-3 h-3 text-slate-400" /> Authorized By: <span className="text-slate-700 font-bold">{performerName}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Completion Feedback Sequence */}
      {isCompleted && false && (
        <Card variant="md" className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 shadow-sm mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-black text-blue-900 text-lg">Task Resolution Complete</h3>
              <p className="text-sm font-medium text-blue-800 mt-1">Has this output matched your expectations?</p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate(ROUTES.RESIDENT_FEEDBACK.replace(':id', complaint!._id!))}
              className="flex items-center gap-2 font-bold shadow-lg shadow-blue-200"
            >
              <Star className="w-4 h-4 fill-white text-white" />
              Provide Evaluation Matrix
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ComplaintDetailPage;
