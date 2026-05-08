import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
// @ts-ignore
import { useGetComplaintDetailsQuery, useAssignComplaintMutation } from '@/features/complaint/complaint.api';
import { useGetStaffQuery } from '@/features/complaint/complaint.api';
import { showSuccess, showError } from '@/utils/toast';

const DepartmentComplaintDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Queries
  const { data: detailsData, isLoading: isDetailsLoading } = useGetComplaintDetailsQuery(id as string, { skip: !id });
  const { data: staffMap } = useGetStaffQuery();
  const [assignComplaint, { isLoading: isAssigning }] = useAssignComplaintMutation();

  const complaint = detailsData?.data;
  const staffMembers = staffMap?.data || [];

  const handleAssign = async () => {
    if (!selectedStaffId) {
      showError('Please select a staff member');
      return;
    }

    try {
      await assignComplaint({ id: id as string, assignedStaffId: selectedStaffId }).unwrap();
      showSuccess('Complaint assigned successfully');
      setSelectedStaffId('');
    } catch (err: any) {
      showError(err?.data?.message || 'Failed to assign complaint');
    }
  };

  if (isDetailsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold tracking-widest text-sm uppercase">Loading...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Complaint not found</h3>
        <Button variant="outline" className="mt-6" onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINTS)}>
          Back to Complaints
        </Button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'assigned':
        return 'bg-indigo-100 text-indigo-700';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
      case 'completed':
      case 'closed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINTS)}
          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-secondary-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">{complaint?.title}</h1>
          <p className="text-secondary-500 mt-1">Complaint ID: {complaint?._id}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Priority */}
          <Card variant="md" className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500 mb-2">Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(complaint?.status)}`}>
                  {complaint?.status?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-secondary-500 mb-2">Priority</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(complaint?.priority)}`}>
                  {complaint?.priority?.toUpperCase()}
                </span>
              </div>
            </div>
          </Card>

          {/* Complaint Details */}
          <Card variant="md" className="p-6">
            <h2 className="text-lg font-bold text-secondary-900 mb-6">Complaint Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-secondary-500">Description</label>
                <p className="text-secondary-900 mt-2 leading-relaxed">{complaint?.description}</p>
              </div>

              {complaint?.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary-400 mt-1" />
                  <div>
                    <label className="text-sm text-secondary-500">Location</label>
                    <p className="text-secondary-900">{complaint?.location}</p>
                  </div>
                </div>
              )}

              {complaint?.createdAt && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-secondary-400 mt-1" />
                  <div>
                    <label className="text-sm text-secondary-500">Submitted On</label>
                    <p className="text-secondary-900">{new Date(complaint?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Resident Information */}
          {complaint?.residentId && (
            <Card variant="md" className="p-6">
              <h2 className="text-lg font-bold text-secondary-900 mb-6">Resident Information</h2>
              <div className="space-y-4">
                {complaint?.residentId?.firstName && (
                  <div>
                    <label className="text-sm text-secondary-500">Name</label>
                    <p className="text-secondary-900">{complaint?.residentId?.firstName} {complaint?.residentId?.lastName}</p>
                  </div>
                )}

                {complaint?.residentId?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-secondary-400" />
                    <div>
                      <label className="text-sm text-secondary-500">Email</label>
                      <p className="text-secondary-900">{complaint?.residentId?.email}</p>
                    </div>
                  </div>
                )}

                {complaint?.residentId?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-secondary-400" />
                    <div>
                      <label className="text-sm text-secondary-500">Phone</label>
                      <p className="text-secondary-900">{complaint?.residentId?.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {complaint?.attachments && complaint?.attachments?.length > 0 && (
            <Card variant="md" className="p-6">
              <h2 className="text-lg font-bold text-secondary-900 mb-6">Attachments</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {complaint?.attachments?.map((attachment: any, index: number) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square bg-secondary-50 rounded-lg border border-secondary-200 flex items-center justify-center hover:bg-secondary-100 transition-colors"
                  >
                    <img src={attachment} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Assignment Section */}
          <Card variant="md" className="p-6">
            <h2 className="text-lg font-bold text-secondary-900 mb-6">Assign Staff</h2>

            {complaint?.status !== 'resolved' && complaint?.status !== 'closed' && complaint?.status !== 'completed' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-secondary-500 block mb-2">Select Staff Member</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a staff member</option>
                    {staffMembers.map((staff: any) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName} - {staff.position}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleAssign}
                  isLoading={isAssigning}
                  disabled={!selectedStaffId}
                >
                  Assign
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-secondary-600">This complaint has been {complaint?.status}</p>
              </div>
            )}

            {complaint?.assignedStaffId && (
              <div className="mt-6 pt-6 border-t border-secondary-200">
                <label className="text-sm text-secondary-500 block mb-2">Currently Assigned To</label>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-secondary-900 font-semibold">
                    {complaint?.assignedStaffId?.firstName} {complaint?.assignedStaffId?.lastName}
                  </p>
                  <p className="text-sm text-secondary-600">{complaint?.assignedStaffId?.position}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card variant="md" className="p-6">
            <h2 className="text-lg font-bold text-secondary-900 mb-6">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-secondary-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-secondary-500">Created</p>
                  <p className="text-secondary-900">{new Date(complaint?.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {complaint?.updatedAt && (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-secondary-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-secondary-500">Last Updated</p>
                    <p className="text-secondary-900">{new Date(complaint?.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DepartmentComplaintDetailPage;
