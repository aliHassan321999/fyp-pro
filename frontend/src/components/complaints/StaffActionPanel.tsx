import React, { useState } from 'react';
import { useUpdateComplaintStatusMutation } from '@/features/complaint/complaint.api';
import { Button } from '@components/Common';
import { Play, CheckCircle2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface StaffActionPanelProps {
  complaintId: string;
  currentStatus: string;
  isAssignedStaff: boolean;
  onSuccess: () => void;
}

const StaffActionPanel: React.FC<StaffActionPanelProps> = ({ 
  complaintId, 
  currentStatus, 
  isAssignedStaff,
  onSuccess
}) => {
  const [updateStatus, { isLoading }] = useUpdateComplaintStatusMutation();
  const [remarks, setRemarks] = useState('');
  const [showRemarksInput, setShowRemarksInput] = useState(false);

  // If not the assigned staff, or if it's already resolved/closed, or open, don't show actions.
  // We only show actions for 'assigned' and 'in_progress'.
  if (!isAssignedStaff || !['assigned', 'in_progress'].includes(currentStatus)) {
    return null;
  }

  const handleAction = async (targetStatus: string) => {
    if (targetStatus === 'resolved' && !remarks.trim()) {
      showError('Please provide resolution remarks.');
      return;
    }

    try {
      await updateStatus({
        id: complaintId,
        status: targetStatus as any,
        resolutionRemarks: targetStatus === 'resolved' ? remarks : undefined
      }).unwrap();
      
      showSuccess(`Status successfully updated to ${targetStatus.replace('_', ' ')}`);
      onSuccess();
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200/60">
      <h3 className="text-sm font-bold text-zinc-900 tracking-tight mb-4">Staff Actions</h3>
      
      {currentStatus === 'assigned' && (
        <Button 
          variant="primary" 
          onClick={() => handleAction('in_progress')}
          isLoading={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" /> Start Work
        </Button>
      )}

      {currentStatus === 'in_progress' && (
        <div className="space-y-4 bg-zinc-50 p-5 rounded-xl border border-zinc-200/60">
          {!showRemarksInput ? (
            <Button 
              variant="primary" 
              onClick={() => setShowRemarksInput(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Mark as Resolved
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-zinc-600 uppercase tracking-widest">
                Resolution Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
                placeholder="Describe what was done to resolve this issue..."
                className="w-full p-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-zinc-800 placeholder-zinc-400 min-h-[100px]"
              />
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowRemarksInput(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  isLoading={isLoading}
                  onClick={() => handleAction('resolved')}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Confirm Resolution
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffActionPanel;
