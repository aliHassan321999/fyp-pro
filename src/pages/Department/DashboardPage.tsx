import React, { useState, useEffect, useMemo } from 'react';
import { Users, AlertCircle, TrendingUp, CheckCircle2, Loader } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface StaffMember {
  _id: string;
  profile: {
    fullName: string;
  };
  email: string;
}

interface DepartmentData {
  _id: string;
  name: string;
  slaTargetHours: number;
  staffCount?: number;
}

interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

const DepartmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [departmentData, setDepartmentData] = useState<DepartmentData | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [complaintStats, setComplaintStats] = useState<ComplaintStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch department data
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.departmentId) {
          setError('No department assigned to user');
          setLoading(false);
          return;
        }

        // Fetch department details
        const deptRes = await axios.get(
          `http://localhost:5000/api/departments/${user.departmentId}`,
          { withCredentials: true }
        );
        setDepartmentData(deptRes.data.data);

        // Fetch department staff
        const staffRes = await axios.get(
          `http://localhost:5000/api/departments/${user.departmentId}/staff`,
          { withCredentials: true }
        );
        setStaffMembers(staffRes.data.data || []);

        // Fetch complaints for this department
        const complaintsRes = await axios.get(
          `http://localhost:5000/api/complaints`,
          { withCredentials: true }
        );

        const allComplaints = complaintsRes.data.data || [];
        const deptComplaints = allComplaints.filter(
          (c: any) => c.departmentId === user.departmentId
        );

        setComplaintStats({
          total: deptComplaints.length,
          pending: deptComplaints.filter((c: any) => c.status === 'pending').length,
          inProgress: deptComplaints.filter((c: any) => c.status === 'in_progress').length,
          completed: deptComplaints.filter((c: any) => c.status === 'completed').length,
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching department data:', err);
        setError(err.response?.data?.message || 'Failed to load department data');
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [user?.departmentId]);

  // Get department's staff
  const topStaff = useMemo(() => {
    return staffMembers.map((staff) => ({
      id: staff._id,
      name: staff.profile.fullName,
      position: 'Staff Member',
      assignedCount: 0,
      completedCount: 0,
    }));
  }, [staffMembers]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const efficiency = complaintStats.total > 0 
      ? Math.round((complaintStats.completed / complaintStats.total) * 100) 
      : 0;

    return [
      {
        label: 'Total Complaints',
        value: complaintStats.total.toString(),
        icon: Users,
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      {
        label: 'Pending',
        value: complaintStats.pending.toString(),
        icon: AlertCircle,
        color: 'bg-red-100',
        textColor: 'text-red-700',
      },
      {
        label: 'In Progress',
        value: complaintStats.inProgress.toString(),
        icon: TrendingUp,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-700',
      },
      {
        label: 'Completed',
        value: complaintStats.completed.toString(),
        icon: CheckCircle2,
        color: 'bg-green-100',
        textColor: 'text-green-700',
      },
    ];
  }, [complaintStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 mx-auto text-primary-600 mb-4" />
          <p className="text-secondary-600">Loading department data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card variant="md" className="p-6 bg-red-50 border-red-200">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-700 font-semibold">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          {departmentData?.name || 'Department'} Department
        </h1>
        <p className="text-secondary-600 mt-2">Department overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} variant="md" className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-secondary-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Staff Members */}
      <Card variant="md" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">
            Staff Members ({staffMembers.length})
          </h2>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.DEPARTMENT_STAFF)}
          >
            View All Staff
          </Button>
        </div>

        {staffMembers.length > 0 ? (
          <div className="space-y-4">
            {topStaff.slice(0, 5).map((staff) => (
              <div
                key={staff.id}
                className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary-900">{staff.name}</h3>
                  <p className="text-sm text-secondary-600">{staff.position}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
            <p className="text-secondary-600">No staff members assigned yet</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h2 className="text-lg font-bold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.DEPARTMENT_STAFF)}
          >
            Manage Staff
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINTS)}
          >
            View Complaints
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.DEPARTMENT_PERFORMANCE)}
          >
            View Reports
          </Button>
          <Button variant="outline" fullWidth>
            Generate Report
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DepartmentDashboardPage;
