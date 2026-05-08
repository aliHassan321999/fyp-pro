import React, { useState } from 'react';
import { useGetStaffRecommendationsQuery } from '../../features/admin/admin.api';
import { useAssignComplaintMutation } from '../../features/complaint/complaint.api';

interface AssignStaffPanelProps {
  complaintId: string;
  departmentId: string;
  onAssignSuccess?: () => void;
}

const AssignStaffPanel: React.FC<AssignStaffPanelProps> = ({ complaintId, departmentId, onAssignSuccess }) => {
  const { data: response, isLoading, isError, refetch } = useGetStaffRecommendationsQuery(departmentId);
  const [assignComplaint, { isLoading: isAssigning }] = useAssignComplaintMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAssign = async (staffId: string) => {
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const res = await assignComplaint({ id: complaintId, assignedStaffId: staffId }).unwrap();
      if (res.success) {
        setSuccessMsg('Staff assigned successfully.');
        if (onAssignSuccess) onAssignSuccess();
      } else {
        setErrorMsg(res.message || 'Failed to assign staff.');
      }
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err.message || 'An error occurred during assignment.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 border rounded-xl bg-gray-50/50">
        <h3 className="font-bold text-gray-700">Recommended Staff</h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded-xl text-center">
        <p className="text-sm text-red-600 mb-2">Failed to load staff recommendations.</p>
        <button onClick={() => refetch()} className="text-xs font-bold text-red-700 underline">Retry</button>
      </div>
    );
  }

  const staffList = response.data || [];
  
  // Ensure sorted by highest score first (the API should already do this, but just in case)
  const sortedStaff = [...staffList].sort((a, b) => (b.score || 0) - (a.score || 0));

  if (sortedStaff.length === 0) {
    return (
      <div className="p-6 border rounded-xl bg-gray-50 text-center">
        <p className="text-sm text-gray-500 italic">No available staff in this department.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 tracking-tight">AI Staff Recommendations</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
          {sortedStaff.length} Available
        </span>
      </div>

      {errorMsg && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
          {successMsg}
        </div>
      )}

      <div className="p-4 space-y-3">
        {sortedStaff.map((staff: any, index: number) => {
          const isTopMatch = index === 0 && staff.score > 0;
          
          return (
            <div 
              key={staff.staffId} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                isTopMatch 
                  ? 'border-indigo-300 bg-indigo-50/50 shadow-sm' 
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-gray-900">{staff.name}</h4>
                  {isTopMatch && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-600 text-white rounded-sm">
                      Top Match
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    Rank: <span className="text-gray-700 uppercase">{staff.rank}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    Active Load: <span className="text-gray-700">{staff.activeComplaints} issues</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Score: <span className="text-emerald-700 font-bold">{Math.round(staff.score)}</span>
                  </span>
                </div>
              </div>

              <div className="ml-4">
                <button
                  onClick={() => handleAssign(staff.staffId)}
                  disabled={isAssigning}
                  className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${
                    isTopMatch 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-indigo-400' 
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
                  }`}
                >
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AssignStaffPanel;
