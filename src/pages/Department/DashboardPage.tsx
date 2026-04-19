import React, { useMemo } from 'react';
import { Users, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';

const DepartmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock department staff - in real app, filtered by department from backend
  const departmentStaffMap: Record<string, Array<{ id: string; name: string; position: string; assignedCount: number; completedCount: number }>> = {
    'DEPT-001': [
      { id: '1', name: 'John Smith', position: 'Senior Technician', assignedCount: 12, completedCount: 11 },
      { id: '2', name: 'Sarah Johnson', position: 'Maintenance Supervisor', assignedCount: 10, completedCount: 10 },
      { id: '3', name: 'Mike Wilson', position: 'Technician', assignedCount: 9, completedCount: 7 },
    ],
    'DEPT-002': [
      { id: '4', name: 'Alice Green', position: 'Utilities Manager', assignedCount: 8, completedCount: 8 },
      { id: '5', name: 'Bob Turner', position: 'Utility Technician', assignedCount: 6, completedCount: 5 },
    ],
    'DEPT-003': [
      { id: '6', name: 'Charlie Brown', position: 'Security Chief', assignedCount: 15, completedCount: 14 },
      { id: '7', name: 'Diana Prince', position: 'Security Officer', assignedCount: 11, completedCount: 10 },
      { id: '8', name: 'Eve Davis', position: 'Security Officer', assignedCount: 9, completedCount: 9 },
    ],
    'DEPT-004': [
      { id: '9', name: 'Frank Miller', position: 'Landscaping Supervisor', assignedCount: 7, completedCount: 7 },
      { id: '10', name: 'Grace Lee', position: 'Landscaper', assignedCount: 5, completedCount: 4 },
    ],
  };

  // Get department's staff
  const topStaff = useMemo(() => {
    if (!user?.departmentId) return [];
    return departmentStaffMap[user.departmentId] || [];
  }, [user?.departmentId]);

  // Departments mapping for display
  const departmentNames: Record<string, string> = {
    'DEPT-001': 'Maintenance',
    'DEPT-002': 'Utilities',
    'DEPT-003': 'Security',
    'DEPT-004': 'Landscaping',
  };

  // Calculate stats based on department staff
  const stats = useMemo(() => {
    if (!topStaff.length) return [];
    
    const totalAssigned = topStaff.reduce((sum, s) => sum + s.assignedCount, 0);
    const totalCompleted = topStaff.reduce((sum, s) => sum + s.completedCount, 0);
    const pending = totalAssigned - totalCompleted;
    const efficiency = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    return [
      {
        label: 'Active Staff',
        value: topStaff.length.toString(),
        icon: Users,
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      {
        label: 'Pending Issues',
        value: pending.toString(),
        icon: AlertCircle,
        color: 'bg-red-100',
        textColor: 'text-red-700',
      },
      {
        label: 'Completed This Period',
        value: totalCompleted.toString(),
        icon: CheckCircle2,
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      {
        label: 'Efficiency Score',
        value: `${efficiency}%`,
        icon: TrendingUp,
        color: 'bg-purple-100',
        textColor: 'text-purple-700',
      },
    ];
  }, [topStaff]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">
          {departmentNames[user?.departmentId || ''] || 'Department'} Department
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

      {/* Top Performers */}
      <Card variant="md" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">Top Performers</h2>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.DEPARTMENT_STAFF)}
          >
            View All Staff
          </Button>
        </div>

        <div className="space-y-4">
          {topStaff.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-secondary-900">{staff.name}</h3>
                <p className="text-sm text-secondary-600">{staff.position}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-600">{staff.completedCount}</p>
                  <p className="text-xs text-secondary-500">Completed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary-900">{staff.assignedCount}</p>
                  <p className="text-xs text-secondary-500">Assigned</p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
