import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@components/Common';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import axios from 'axios';

interface DepartmentStats {
  _id: string;
  name: string;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  resolutionRate: number;
}

const SuperAdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    resolutionRate: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch departments
      const deptsRes = await axios.get('/api/departments');
      const depts = deptsRes.data.data || [];

      // Fetch complaints
      const complaintsRes = await axios.get('/api/complaints');
      const allComplaints = complaintsRes.data.data || [];

      // Calculate department stats
      const deptStats: DepartmentStats[] = depts.map((dept: any) => {
        const deptComplaints = allComplaints.filter((c: any) => c.departmentId === dept._id);
        const resolved = deptComplaints.filter((c: any) => c.status === 'resolved').length;
        const pending = deptComplaints.filter((c: any) => c.status === 'pending').length;

        return {
          _id: dept._id,
          name: dept.name,
          totalComplaints: deptComplaints.length,
          resolvedComplaints: resolved,
          pendingComplaints: pending,
          resolutionRate: deptComplaints.length > 0 ? Math.round((resolved / deptComplaints.length) * 100) : 0,
        };
      });

      setDepartments(deptStats);
      setComplaints(allComplaints);

      // Calculate total stats
      const totalResolved = allComplaints.filter((c: any) => c.status === 'resolved').length;
      const totalPending = allComplaints.filter((c: any) => c.status === 'pending').length;

      setTotalStats({
        total: allComplaints.length,
        resolved: totalResolved,
        pending: totalPending,
        resolutionRate: allComplaints.length > 0 ? Math.round((totalResolved / allComplaints.length) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-secondary-900">Department Analytics</h1>
          <p className="text-secondary-600 mt-1">Monitor system-wide complaint statistics and department performance</p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="md" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Total Complaints</p>
              <p className="text-3xl font-bold text-secondary-900">{totalStats.total}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card variant="md" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-green-600">{totalStats.resolved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card variant="md" className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{totalStats.pending}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card variant="md" className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Resolution Rate</p>
              <p className="text-3xl font-bold text-blue-900">{totalStats.resolutionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Department Performance</h2>

        {departments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-secondary-200 bg-secondary-50">
                  <th className="px-4 py-3 text-left font-semibold text-secondary-900">Department</th>
                  <th className="px-4 py-3 text-center font-semibold text-secondary-900">Total</th>
                  <th className="px-4 py-3 text-center font-semibold text-secondary-900">Resolved</th>
                  <th className="px-4 py-3 text-center font-semibold text-secondary-900">Pending</th>
                  <th className="px-4 py-3 text-center font-semibold text-secondary-900">Resolution Rate</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr key={dept._id} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="px-4 py-3 font-medium text-secondary-900">{dept.name}</td>
                    <td className="px-4 py-3 text-center text-secondary-700">{dept.totalComplaints}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {dept.resolvedComplaints}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        {dept.pendingComplaints}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-secondary-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${dept.resolutionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-secondary-900 w-10 text-right">{dept.resolutionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-secondary-600">No department data available</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SuperAdminAnalyticsPage;
