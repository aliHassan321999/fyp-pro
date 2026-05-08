import React from 'react';
import { AlertCircle, Clock, CheckCircle2, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';
import { useGetDepartmentHeadDashboardQuery } from '@/features/department/department.api';
import { showError } from '@/utils/toast';

const DepartmentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboardData, isLoading, isError } = useGetDepartmentHeadDashboardQuery();

  // Departments mapping for display
  const departmentNames: Record<string, string> = {
    'DEPT-001': 'Maintenance',
    'DEPT-002': 'Utilities',
    'DEPT-003': 'Security',
    'DEPT-004': 'Landscaping',
  };

  if (isError) {
    showError('Failed to load dashboard data');
  }

  const stats = dashboardData?.data?.stats || {
    unassigned: 0,
    inProgress: 0,
    resolvedToday: 0,
    slaAtRisk: 0,
  };

  const recentComplaints = dashboardData?.data?.recentComplaints || [];

  const statsConfig = [
    {
      label: 'Unassigned',
      value: stats.unassigned.toString(),
      icon: FileText,
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      label: 'In Progress',
      value: stats.inProgress.toString(),
      icon: Clock,
      color: 'bg-amber-50',
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
    },
    {
      label: 'Resolved Today',
      value: stats.resolvedToday.toString(),
      icon: CheckCircle2,
      color: 'bg-green-50',
      textColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      label: 'SLA At Risk',
      value: stats.slaAtRisk.toString(),
      icon: AlertCircle,
      color: 'bg-red-50',
      textColor: 'text-red-600',
      iconBg: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {departmentNames[user?.departmentId || ''] || 'Department'} Department
        </h1>
        <p className="text-blue-100">Welcome back! Here's your department overview.</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsConfig.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} variant="md" className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-secondary-500 mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                      <Icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Complaints */}
          {recentComplaints && recentComplaints.length > 0 && (
            <Card variant="md" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                  <h2 className="text-xl font-bold text-secondary-900">Recent Complaints</h2>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINTS)}
                >
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {recentComplaints.map((complaint: any) => (
                  <div
                    key={complaint._id}
                    onClick={() => navigate(ROUTES.DEPARTMENT_COMPLAINT_DETAIL.replace(':id', complaint._id))}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${
                        complaint.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <AlertCircle className={`w-5 h-5 ${
                          complaint.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-secondary-900">{complaint.title}</h3>
                        <p className="text-sm text-secondary-600 mt-1">
                          Status: <span className="font-medium">{complaint.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : complaint.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {complaint.priority?.toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary-400" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
        </>
      )}
    </div>
  );
};

export default DepartmentDashboardPage;
