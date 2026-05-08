import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Departments',
      value: '8',
      icon: Building2,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'Pending Approvals',
      value: '12',
      icon: AlertCircle,
      color: 'bg-red-100',
      textColor: 'text-red-700',
    },
    {
      label: 'Active Residents',
      value: '2,847',
      icon: Users,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'Monthly Growth',
      value: '+8.5%',
      icon: TrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      name: 'Maintenance',
      head: 'John Smith',
      status: 'pending',
      submittedDate: '2025-01-15',
    },
    {
      id: '2',
      name: 'Landscaping',
      head: 'Sarah Johnson',
      status: 'pending',
      submittedDate: '2025-01-16',
    },
    {
      id: '3',
      name: 'Security',
      head: 'Mike Wilson',
      status: 'pending',
      submittedDate: '2025-01-17',
    },
  ];

  const departmentStats = [
    {
      name: 'Maintenance',
      staff: 24,
      openComplaints: 8,
      resolvedThisMonth: 156,
    },
    {
      name: 'Infrastructure',
      staff: 18,
      openComplaints: 5,
      resolvedThisMonth: 98,
    },
    {
      name: 'Cleanliness',
      staff: 15,
      openComplaints: 3,
      resolvedThisMonth: 67,
    },
    {
      name: 'Security',
      staff: 12,
      openComplaints: 2,
      resolvedThisMonth: 45,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Admin Dashboard</h1>
        <p className="text-secondary-600 mt-2">System overview and management</p>
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

      {/* Pending Approvals */}
      <Card variant="md" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-secondary-900">Pending Approvals</h2>
            <p className="text-sm text-secondary-600 mt-1">{pendingApprovals.length} new departments awaiting approval</p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
          >
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="p-4 bg-secondary-50 rounded-lg border border-secondary-200 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold text-secondary-900">{approval.name}</h3>
                <p className="text-sm text-secondary-600">Head: {approval.head}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-secondary-500">
                  {new Date(approval.submittedDate).toLocaleDateString()}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
                >
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Department Stats */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Department Overview</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Department
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Staff
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Open
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  This Month
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept, index) => (
                <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-secondary-900">{dept.name}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-secondary-900">{dept.staff}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <StatusBadge
                      status={dept.openComplaints.toString()}
                      color={dept.openComplaints > 5 ? 'bg-red-100' : 'bg-yellow-100'}
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-blue-600">{dept.resolvedThisMonth}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h2 className="text-lg font-bold text-secondary-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.ADMIN_DEPARTMENTS)}
          >
            Manage Departments
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.ADMIN_APPROVE_RESIDENTS)}
          >
            Review Approvals
          </Button>
          <Button variant="outline" fullWidth>
            Generate Report
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
