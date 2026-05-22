import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { Card, Button } from '@components/Common';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import axios from 'axios';

interface DepartmentRequest {
  _id: string;
  name: string;
  description: string;
  slaTargetHours: number;
  keywords: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

const SuperAdminRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DepartmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      // Show departments without a specific approval status (simulating pending)
      setRequests((res.data.data || []).map((d: any) => ({
        ...d,
        status: 'pending'
      })));
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (deptId: string) => {
    try {
      await axios.put(`/api/departments/${deptId}`, { status: 'approved' });
      setRequests(requests.filter(r => r._id !== deptId));
      alert('✅ Department approved successfully!');
    } catch (error) {
      console.error('Error approving department:', error);
      alert('❌ Failed to approve department');
    }
  };

  const handleReject = async (deptId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await axios.delete(`/api/departments/${deptId}`, {
        data: { reason: rejectReason }
      });
      setRequests(requests.filter(r => r._id !== deptId));
      setSelectedId(null);
      setRejectReason('');
      alert('❌ Department rejected successfully!');
    } catch (error) {
      console.error('Error rejecting department:', error);
      alert('Failed to reject department');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.SUPERADMIN_DASHBOARD)}
            className="p-2 hover:bg-secondary-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-700" />
          </button>
          <h1 className="text-3xl font-bold text-secondary-900">Department Approvals</h1>
        </div>
        <Card variant="md" className="p-6 text-center">
          <p className="text-secondary-600">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.SUPERADMIN_DASHBOARD)}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-secondary-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Department Approvals</h1>
          <p className="text-secondary-600 mt-1">Review and approve new department requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="md" className="p-6 bg-orange-50 border border-orange-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-700">{requests.length}</p>
            </div>
          </div>
        </Card>

        <Card variant="md" className="p-6 bg-blue-50 border border-blue-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Active Departments</p>
              <p className="text-2xl font-bold text-blue-700">5</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Requests List */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card
              key={request._id}
              variant="md"
              className="p-6 border-l-4 border-orange-400 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary-900">{request.name}</h3>
                    <p className="text-sm text-secondary-600 mt-2">{request.description}</p>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {request.keywords?.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {request.keywords && request.keywords.length > 3 && (
                        <span className="px-3 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                          +{request.keywords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(request._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setSelectedId(selectedId === request._id ? null : request._id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Rejection Form */}
                {selectedId === request._id && (
                  <div className="mt-4 pt-4 border-t border-secondary-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary-900 mb-2">
                        Reason for Rejection
                      </label>
                      <textarea
                        placeholder="Explain why this department is being rejected..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedId(null);
                          setRejectReason('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleReject(request._id)}
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="md" className="p-12 text-center bg-blue-50 border-blue-200">
          <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">No Pending Requests</h3>
          <p className="text-secondary-600">All department requests have been reviewed and approved</p>
        </Card>
      )}
    </div>
  );
};

export default SuperAdminRequestsPage;
