import React, { useState } from 'react';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useGetComplaintsQuery } from '@/features/complaint/complaint.api';

const CompletedWorkPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  // Redux Injection Maps
  const { data: complaintsData, isLoading, isError } = useGetComplaintsQuery();

  // RTK handles the user._id filter automatically via Express Node
  const complaints = complaintsData?.data || [];

  // Filter to show only completed/resolved/closed complaints
  const completedComplaints = complaints.filter((complaint) => {
    return complaint.status === 'resolved' || complaint.status === 'closed';
  });

  const filteredComplaints = completedComplaints.filter((complaint) => {
    const titleMatch = complaint.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = complaint.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || descMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Completed Work</h1>
          </div>
          <p className="text-gray-600">View all your resolved and closed complaints</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Complaints</label>
              <InputField
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setSearchTerm('')}
              className="px-6"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredComplaints.length}</span> completed ticket{filteredComplaints.length !== 1 ? 's' : ''}
        </div>

        {/* Complaints List */}
        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Complaints</h3>
            <p className="text-red-700">There was an error retrieving your completed work. Please try again later.</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-100 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Work</h3>
            <p className="text-gray-600">
              {completedComplaints.length === 0
                ? 'You haven\'t completed any complaints yet.'
                : 'No complaints match your search criteria.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint._id}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedComplaint(selectedComplaint === complaint._id ? null : complaint._id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{complaint.title}</h3>
                      <StatusBadge
                        status={complaint.status}
                        className={`${getStatusColor(complaint.status)} px-3 py-1 rounded-full text-sm font-medium`}
                      />
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{complaint.description}</p>
                    
                    <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">ID: {complaint._id?.slice(-6)}</span>
                      <span>Submitted: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                      {complaint.resolvedAt && (
                        <span className="text-emerald-600 font-medium">
                          Resolved: {new Date(complaint.resolvedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">{complaint.priority || 'Normal'}</div>
                      <div className="text-xs">Priority</div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedComplaint === complaint._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <p className="font-medium text-gray-900">{complaint.category || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium text-gray-900">
                          {typeof complaint.location === 'string' ? complaint.location : complaint.location?.address || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Submitted By:</span>
                        <p className="font-medium text-gray-900">{complaint.submittedBy?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Resolution Time:</span>
                        <p className="font-medium text-gray-900">
                          {complaint.resolvedAt
                            ? `${Math.round((new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60))} hours`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {complaint.resolution && (
                      <div>
                        <span className="text-gray-500 text-sm">Resolution Notes:</span>
                        <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded">{complaint.resolution}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedWorkPage;
