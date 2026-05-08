import React from 'react';
import { BarChart3, TrendingUp, Users, Building2 } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';

const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Residents',
      value: '12,847',
      icon: Users,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      trend: '+8.5% this month',
    },
    {
      label: 'Active Departments',
      value: '8',
      icon: Building2,
      color: 'bg-green-100',
      textColor: 'text-green-700',
      trend: 'All operational',
    },
    {
      label: 'Total Complaints',
      value: '18,423',
      icon: BarChart3,
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      trend: '+2,156 this month',
    },
    {
      label: 'System Health',
      value: '98.5%',
      icon: TrendingUp,
      color: 'bg-green-100',
      textColor: 'text-green-700',
      trend: 'Excellent',
    },
  ];

  const complexStats = [
    {
      name: 'East Complex',
      residents: 4200,
      complaints: 2156,
      resolvedRate: 94,
    },
    {
      name: 'West Complex',
      residents: 3800,
      complaints: 1890,
      resolvedRate: 91,
    },
    {
      name: 'Central Complex',
      residents: 2500,
      complaints: 1250,
      resolvedRate: 96,
    },
    {
      name: 'North Complex',
      residents: 2347,
      complaints: 1127,
      resolvedRate: 89,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">SuperAdmin Dashboard</h1>
        <p className="text-secondary-600 mt-2">System-wide analytics and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} variant="md" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-secondary-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <p className="text-xs text-secondary-600">{stat.trend}</p>
            </Card>
          );
        })}
      </div>

      {/* Complex Comparison */}
      <Card variant="md" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">Complex Performance</h2>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.SUPERADMIN_ANALYTICS)}
          >
            View Analytics
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Complex
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Residents
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Complaints
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Resolution Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {complexStats.map((complex, index) => (
                <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-secondary-900">{complex.name}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-secondary-900">{complex.residents.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <p className="font-semibold text-secondary-900">{complex.complaints.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 bg-secondary-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${complex.resolvedRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-secondary-900 w-8">
                        {complex.resolvedRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate(ROUTES.SUPERADMIN_ANALYTICS)}
          >
            View Analytics
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(ROUTES.SUPERADMIN_REPORTS)}
          >
            Generate Reports
          </Button>
          <Button variant="outline" fullWidth>
            System Settings
          </Button>
        </div>
      </Card>

      {/* Alert & Important Info */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-blue-50 to-primary-50 border-primary-200">
        <h2 className="text-lg font-bold text-secondary-900 mb-4">System Status</h2>
        <div className="space-y-3 text-sm text-secondary-700">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>All systems operational</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>No pending critical issues</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>2 new resident approval requests pending</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboardPage;
