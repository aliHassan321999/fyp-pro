import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { Card } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import axios from 'axios';

interface StaffPerformance {
  _id: string;
  profile: {
    fullName: string;
  };
  assignedComplaints: number;
  completedComplaints: number;
  pendingComplaints: number;
}

const DepartmentPerformancePage: React.FC = () => {
  const { user } = useAuth();
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
  }, [user?.departmentId]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.departmentId) {
        setError('No department assigned');
        setLoading(false);
        return;
      }

      // Fetch staff
      const staffRes = await axios.get(
        `/api/departments/${user.departmentId}/staff`,
        { withCredentials: true }
      );

      // Fetch all complaints
      const complaintsRes = await axios.get(
        '/api/complaints',
        { withCredentials: true }
      );

      const allComplaints = complaintsRes.data.data || [];
      const staffList = staffRes.data.data || [];

      // Calculate performance for each staff
      const performance = staffList.map((staff: any) => {
        const staffComplaints = allComplaints.filter((c: any) => c.assignedStaffId === staff._id);
        return {
          _id: staff._id,
          profile: staff.profile,
          assignedComplaints: staffComplaints.length,
          completedComplaints: staffComplaints.filter((c: any) => c.status === 'completed').length,
          pendingComplaints: staffComplaints.filter((c: any) => c.status === 'pending').length,
        };
      });

      setStaffPerformance(performance.sort((a, b) => b.completedComplaints - a.completedComplaints));
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching performance data:', err);
      setError(err.response?.data?.message || 'Failed to load performance data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 mx-auto text-primary-600 mb-4" />
          <p className="text-secondary-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="md" className="p-6 bg-red-50 border-red-200">
          <p className="text-red-700 font-semibold text-center">{error}</p>
        </Card>
      </div>
    );
  }

  const totalAssigned = staffPerformance.reduce((sum, s) => sum + s.assignedComplaints, 0);
  const totalCompleted = staffPerformance.reduce((sum, s) => sum + s.completedComplaints, 0);
  const totalPending = staffPerformance.reduce((sum, s) => sum + s.pendingComplaints, 0);
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Department Performance</h1>
        <p className="text-secondary-600 mt-2">Staff performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="md" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Assigned</p>
              <p className="text-3xl font-bold text-secondary-900">{totalAssigned}</p>
            </div>
          </div>
        </Card>

        <Card variant="md" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Completed</p>
              <p className="text-3xl font-bold text-secondary-900">{totalCompleted}</p>
            </div>
          </div>
        </Card>

        <Card variant="md" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Pending</p>
              <p className="text-3xl font-bold text-secondary-900">{totalPending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Rate */}
      <Card variant="md" className="p-6">
        <div className="text-center">
          <p className="text-sm text-secondary-600 mb-2">Overall Completion Rate</p>
          <p className="text-5xl font-bold text-primary-600 mb-4">{completionRate}%</p>
          <div className="w-full bg-secondary-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Staff Performance Table */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Staff Performance</h2>

        {staffPerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                    Staff Member
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                    Assigned
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffPerformance.map((staff, index) => {
                  const efficiency =
                    staff.assignedComplaints > 0
                      ? Math.round((staff.completedComplaints / staff.assignedComplaints) * 100)
                      : 0;
                  return (
                    <tr key={staff._id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="px-4 py-4">
                        <p className="font-medium text-secondary-900">{staff.profile.fullName}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-secondary-900">{staff.assignedComplaints}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-green-600">{staff.completedComplaints}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <p className="font-semibold text-yellow-600">{staff.pendingComplaints}</p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {efficiency}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-secondary-600">No staff performance data available</p>
        )}
      </Card>
    </div>
  );
};

export default DepartmentPerformancePage;
