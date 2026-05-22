import React from 'react';
import { useGetComplaintActivityQuery } from '../../features/complaint/complaint.api';

// Simple relative time formatter
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

interface ComplaintTimelineProps {
  complaintId: string;
}

const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ complaintId }) => {
  const { data: response, isLoading, isError } = useGetComplaintActivityQuery(complaintId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (isError || !response?.success) {
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
        Failed to load activity timeline.
      </div>
    );
  }

  const activities = response.data || [];

  if (activities.length === 0) {
    return (
      <div className="text-gray-500 italic p-4 text-center border rounded-md bg-gray-50">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-3 py-2 space-y-6">
      {activities.map((item, index) => {
        let message = '';
        
        // Interpret metadata based on action
        if (item.action === 'status_updated') {
          message = `Status changed from ${item.metadata?.from || 'Unknown'} to ${item.metadata?.to || 'Unknown'}`;
        } else if (item.action === 'assigned') {
          message = `Assigned to ${item.metadata?.assignedTo || 'Unknown Staff'}`;
        } else if (item.action === 'sla_breached') {
          message = item.metadata?.message || 'SLA breached';
        } else if (item.action === 'created') {
          message = 'Complaint created';
        } else {
          message = item.action;
        }

        return (
          <div key={index} className="relative pl-6">
            {/* Timeline dot */}
            <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 border border-white"></div>
            
            {/* Content card */}
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900">{item.performedBy?.name || 'System'}</span>
                <span className="text-xs text-gray-500">{getRelativeTime(item.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ComplaintTimeline;
