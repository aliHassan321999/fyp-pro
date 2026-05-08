import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';

interface DepartmentRequest {
  id: string;
  name: string;
  head: string;
  location: string;
  email: string;
  phone: string;
  description: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy?: string;
}

const SuperAdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<DepartmentRequest[]>([
    {
      id: '1',
      name: 'Landscaping',
      head: 'David Brown',
      location: 'Grounds Area',
      email: 'landscaping@complex.com',
      phone: '+971-5034343434',
      description: 'New landscaping department for maintenance of gardens and outdoor areas',
      requestedDate: '2025-01-18',
      status: 'pending',
      requestedBy: 'Admin User',
    },
    {
      id: '2',
      name: 'Pest Control',
      head: 'Linda Martinez',
      location: 'Building D',
      email: 'pestcontrol@complex.com',
      phone: '+971-5056565656',
      description: 'Dedicated pest control and fumigation services department',
      requestedDate: '2025-01-15',
      status: 'pending',
      requestedBy: 'Admin User',
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const handleApprove = (requestId: string) => {
    const approved = requests.find(r => r.id === requestId);
    if (!approved) return;

    setRequests(
      requests.map(r =>
        r.id === requestId
          ? { ...r, status: 'approved' as const }
          : r
      )
    );

    alert(`✅ Department Approved!\n\n${approved.name}\nHead: ${approved.head}\n\nDepartment has been added to the system.`);
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('❌ Please provide a reason for rejection');
      return;
    }

    const rejected = requests.find(r => r.id === requestId);
    if (!rejected) return;

    setRequests(
      requests.map(r =>
        r.id === requestId
          ? { ...r, status: 'rejected' as const }
          : r
      )
    );

    alert(`❌ Department Request Rejected\n\n${rejected.name}\n\nReason: ${rejectReason}\n\nAdmin will be notified.`);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Department Requests</h1>
        <p className="text-secondary-600 mt-2">Manage department creation requests from admins</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="md" className="p-6 bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{pendingRequests.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="md" className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-700">{approvedRequests.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="md" className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{rejectedRequests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} variant="md" className="p-6 border-l-4 border-yellow-400">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Department Info */}
                  <div>
                    <h3 className="text-lg font-bold text-secondary-900">{request.name}</h3>
                    <p className="text-sm text-secondary-600 mt-2">
                      <span className="font-medium">Head:</span> {request.head}
                    </p>
                    <p className="text-sm text-secondary-600">
                      <span className="font-medium">Location:</span> {request.location}
                    </p>
                  </div>

                  {/* Contact Info */}
                  <div className="text-sm">
                    <p className="font-medium text-secondary-900">Contact Details</p>
                    <p className="text-secondary-600 mt-1">Email: {request.email}</p>
                    <p className="text-secondary-600">Phone: {request.phone}</p>
                    <p className="text-xs text-secondary-500 mt-2">
                      Requested: {new Date(request.requestedDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Description */}
                  <div className="text-sm">
                    <p className="font-medium text-secondary-900">Description</p>
                    <p className="text-secondary-600 mt-1">{request.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-between">
                    <Button
                      variant="primary"
                      fullWidth
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleApprove(request.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2 inline" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      fullWidth
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setSelectedRequest(selectedRequest === request.id ? null : request.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2 inline" />
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Rejection Reason Field */}
                {selectedRequest === request.id && (
                  <div className="mt-4 pt-4 border-t border-secondary-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-900 mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        placeholder="Explain why this request is being rejected..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => {
                          setSelectedRequest(null);
                          setRejectReason('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        fullWidth
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReject(request.id)}
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card variant="md" className="p-12 text-center bg-blue-50 border-blue-200">
          <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-secondary-600 text-lg">No pending department requests</p>
          <p className="text-secondary-500 text-sm mt-2">All request have been reviewed</p>
        </Card>
      )}

      {/* Approved Requests */}
      {approvedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Approved Departments ({approvedRequests.length})
          </h2>
          <div className="space-y-4">
            {approvedRequests.map((request) => (
              <Card key={request.id} variant="md" className="p-6 border-l-4 border-green-400 bg-green-50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-secondary-900">{request.name}</h3>
                    <p className="text-sm text-secondary-600 mt-1">Head: {request.head}</p>
                    <p className="text-sm text-secondary-600">Location: {request.location}</p>
                  </div>
                  <div className="text-sm text-secondary-600">
                    <p>Email: {request.email}</p>
                    <p>Phone: {request.phone}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <StatusBadge
                      status="Approved"
                      color="bg-blue-100"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Rejected Requests ({rejectedRequests.length})
          </h2>
          <div className="space-y-4">
            {rejectedRequests.map((request) => (
              <Card key={request.id} variant="md" className="p-6 border-l-4 border-red-400 bg-red-50 opacity-75">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-bold text-secondary-900">{request.name}</h3>
                    <p className="text-sm text-secondary-600 mt-1">Head: {request.head}</p>
                  </div>
                  <div />
                  <div className="flex items-center justify-end">
                    <StatusBadge
                      status="Rejected"
                      color="bg-red-100"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminRequestsPage;
