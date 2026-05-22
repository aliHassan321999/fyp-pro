import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, CheckSquare, Settings, Users, Building2, AlertCircle, TrendingUp } from 'lucide-react';
import { Button, Card } from '@components/Common';
import { ROUTES } from '@constants/index';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface DashboardStats {
  totalUsers: number;
  totalComplaints: number;
  activeDepartments: number;
  pendingApprovals: number;
  resolvedComplaints: number;
  pendingComplaints: number;
}

const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalComplaints: 0,
    activeDepartments: 0,
    pendingApprovals: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersRes = await axios.get('/api/users');
        const users = usersRes.data.data || [];

        // Fetch departments
        const deptsRes = await axios.get('/api/departments');
        const departments = deptsRes.data.data || [];

        // Fetch complaints
        const complaintsRes = await axios.get('/api/complaints');
        const complaints = complaintsRes.data.data || [];

        const resolved = complaints.filter((c: any) => c.status === 'resolved').length;
        const pending = complaints.filter((c: any) => c.status === 'pending').length;

        setStats({
          totalUsers: users.length,
          totalComplaints: complaints.length,
          activeDepartments: departments.length,
          pendingApprovals: 0, // Will be updated when department approval system is implemented
          resolvedComplaints: resolved,
          pendingComplaints: pending,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Complaints',
      value: stats.totalComplaints,
      icon: AlertCircle,
      color: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
    {
      label: 'Active Departments',
      value: stats.activeDepartments,
      icon: Building2,
      color: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckSquare,
      color: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">SuperAdmin Dashboard</h1>
        <p className="text-secondary-600 mt-2">System-wide management and control</p>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} variant="md" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Approve Departments */}
        <Card variant="md" className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">✅ Approve Departments</h3>
              <p className="text-sm text-secondary-600 mb-4">Review and approve new department requests from admins</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.SUPERADMIN_REQUESTS)}
              >
                Manage Requests
              </Button>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Monitor Departments */}
        <Card variant="md" className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">📊 Monitor Departments</h3>
              <p className="text-sm text-secondary-600 mb-4">View department performance, complaints, and statistics</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.SUPERADMIN_ANALYTICS)}
              >
                View Analytics
              </Button>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Admin Performance */}
        <Card variant="md" className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-purple-500">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">👤 Admin Performance</h3>
              <p className="text-sm text-secondary-600 mb-4">Monitor admin efficiency, approvals, and complaint handling</p>
              <Button
                variant="primary"
                size="sm"
                disabled
              >
                Coming Soon
              </Button>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Generate Reports */}
        <Card variant="md" className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-orange-500">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-secondary-900 mb-2">📄 Generate Reports</h3>
              <p className="text-sm text-secondary-600 mb-4">Create complaint, department, and performance reports</p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.SUPERADMIN_REPORTS)}
              >
                Generate Report
              </Button>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-secondary-900 mb-2">✓ System Status</h2>
            <p className="text-secondary-700">All systems operational. {stats.totalComplaints} total complaints being managed across {stats.activeDepartments} departments.</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg">
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboardPage;
