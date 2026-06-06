import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AdminStats {
  _id: string;
  email: string;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  averageResolutionTime: number;
  approvalRate: number;
}

const AdminPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState<AdminStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminPerformance = async () => {
      try {
        setLoading(true);
        // Fetch all users with admin role
        const usersRes = await axios.get('/api/users');
        const admins = usersRes.data.data?.filter((u: any) => u.role === 'admin') || [];

        // Fetch all complaints
        const complaintsRes = await axios.get('/api/complaints');
        const allComplaints = complaintsRes.data.data || [];

        // Calculate stats for each admin
        const stats = admins.map((admin: any) => {
          const adminComplaints = allComplaints.filter((c: any) => c.assignedAdminId === admin._id || c.createdBy === admin._id);
          const resolved = adminComplaints.filter((c: any) => c.status === 'resolved').length;
          const pending = adminComplaints.filter((c: any) => c.status === 'pending').length;

          // Calculate average resolution time
          const resolvedWithTime = adminComplaints.filter((c: any) => c.status === 'resolved' && c.resolvedAt && c.createdAt);
          const avgTime = resolvedWithTime.length > 0
            ? resolvedWithTime.reduce((sum: number, c: any) => {
                const time = new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime();
                return sum + time;
              }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // Convert to hours
            : 0;

          return {
            _id: admin._id,
            email: admin.email,
            totalComplaints: adminComplaints.length,
            resolvedComplaints: resolved,
            pendingComplaints: pending,
            averageResolutionTime: Math.round(avgTime),
            approvalRate: adminComplaints.length > 0 ? Math.round((resolved / adminComplaints.length) * 100) : 0,
          };
        });

        setAdminStats(stats);
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Failed to load admin performance data';
        setError(errorMsg);
        console.error('Error fetching admin performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminPerformance();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-12 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Performance</h1>
            </div>
            <p className="text-gray-600">Monitor admin efficiency, complaint handling, and approval rates</p>
          </div>
          <Button variant="secondary" onClick={() => navigate(ROUTES.SUPERADMIN_DASHBOARD)}>
            Back to Dashboard
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-4 bg-red-50 border border-red-200 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </Card>
        )}

        {/* No Data State */}
        {!loading && adminStats.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Admin Data Available</h3>
            <p className="text-gray-600">No admins found in the system yet.</p>
          </Card>
        )}

        {/* Admin Performance Cards */}
        {!loading && adminStats.length > 0 && (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{adminStats.length}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {adminStats.reduce((sum, a) => sum + a.totalComplaints, 0)}
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Rate</p>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {adminStats.length > 0
                    ? Math.round(adminStats.reduce((sum, a) => sum + a.approvalRate, 0) / adminStats.length)
                    : 0}%
                </p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-600">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {adminStats.length > 0
                    ? Math.round(adminStats.reduce((sum, a) => sum + a.averageResolutionTime, 0) / adminStats.length)
                    : 0}h
                </p>
              </Card>
            </div>

            {/* Detailed Admin Performance Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Admin Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total Complaints</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Resolved</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pending</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Resolution Rate</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Avg Time (hrs)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStats.map((admin) => (
                      <tr key={admin._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.totalComplaints}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            {admin.resolvedComplaints}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            {admin.pendingComplaints}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full transition-all"
                                style={{ width: `${admin.approvalRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{admin.approvalRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.averageResolutionTime}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Performance Insights */}
            <Card className="p-6 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance Insights
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Best Performer:</strong> {adminStats.length > 0 ? adminStats.reduce((a, b) => b.approvalRate - a.approvalRate)[0]?.email : 'N/A'}</li>
                <li>• <strong>Total Complaints Handled:</strong> {adminStats.reduce((sum, a) => sum + a.totalComplaints, 0)}</li>
                <li>• <strong>System Average Resolution Time:</strong> {Math.round(adminStats.reduce((sum, a) => sum + a.averageResolutionTime, 0) / adminStats.length)} hours</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPerformancePage;
