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
          className="px-3 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </Card>

      {/* Complaint Trends */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Complaint Trends</h2>

        {/* Bar Chart */}
        <div className="space-y-4">
          <div className="flex items-end gap-2 h-64 bg-secondary-50 p-6 rounded-lg">
            {complaintTrends.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 h-56 items-end">
                  {/* Filed Bar */}
                  <div
                    className="flex-1 bg-primary-500 rounded-t"
                    style={{ height: `${(data.filed / maxValue) * 220}px` }}
                    title={`${data.filed} filed`}
                  ></div>
                  {/* Resolved Bar */}
                  <div
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${(data.resolved / maxValue) * 220}px` }}
                    title={`${data.resolved} resolved`}
                  ></div>
                </div>
                <p className="text-xs font-medium text-secondary-700">{data.month}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-6 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span>Filed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary-600">12,847</p>
            <p className="text-sm text-secondary-600 mt-1">Total Filed</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">12,073</p>
            <p className="text-sm text-secondary-600 mt-1">Total Resolved</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-600">94%</p>
            <p className="text-sm text-secondary-600 mt-1">Resolution Rate</p>
          </div>
        </div>
      </Card>

      {/* Department Comparison */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Department Performance Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Department
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Filed
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Resolved
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Efficiency Score
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentComparisonData.map((dept, index) => (
                <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-secondary-900">{dept.dept}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-secondary-900">{dept.filed.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-blue-600">{dept.resolved.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${dept.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-secondary-900 w-8">
                        {dept.efficiency}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Insights */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-purple-50 to-primary-50 border-primary-200">
        <h2 className="text-lg font-bold text-secondary-900 mb-4">Key Insights & Recommendations</h2>
        <ul className="space-y-3 text-sm text-secondary-700">
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>System-wide efficiency improved by 3% over last month</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Maintenance department leading with 94% efficiency rate</span>
          </li>
          <li className="flex gap-3">
            <span className="text-yellow-600 font-bold">⚠</span>
            <span>Landscaping department efficiency at 84% - consider additional resources</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">ℹ</span>
            <span>Complaint volume trending upward - monitor capacity planning</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SuperAdminAnalyticsPage;
