import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, Users, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { Button, Card, StatusBadge } from '@components/Common';
import { ROUTES } from '@constants/index';
import { queueService } from '@services/queueService';

const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completeSuccess, setCompleteSuccess] = useState<string | null>(null);
  const [completedComplaints, setCompletedComplaints] = useState<string[]>([]);

  // Mock complaints data - in real app, this would be filtered from backend
  const allComplaints = [
    {
      id: '001',
      departmentId: 'DEPT-001',
      title: 'Broken Street Light',
      category: 'Maintenance',
      resident: 'Ahmed Ali',
      status: 'in-progress' as const,
      assignedDate: '2025-01-15',
    },
    {
      id: '002',
      departmentId: 'DEPT-001',
      title: 'Water Leak in Building B',
      category: 'Infrastructure',
      resident: 'Fatima Hassan',
      status: 'in-progress' as const,
      assignedDate: '2025-01-14',
    },
    {
      id: '003',
      departmentId: 'DEPT-002',
      title: 'Garbage Collection Issue',
      category: 'Cleanliness',
      resident: 'Mohamed Saeed',
      status: 'completed' as const,
      assignedDate: '2025-01-10',
    },
    {
      id: '004',
      departmentId: 'DEPT-003',
      title: 'Broken Gate Lock',
      category: 'Security',
      resident: 'Amira Khan',
      status: 'in-progress' as const,
      assignedDate: '2025-01-16',
    },
    {
      id: '005',
      departmentId: 'DEPT-001',
      title: 'Roof Damage',
      category: 'Maintenance',
      resident: 'Omar Hassan',
      status: 'pending' as const,
      assignedDate: '2025-01-17',
    },
    {
      id: '006',
      departmentId: 'DEPT-001',
      title: 'Pipe Burst',
      category: 'Infrastructure',
      resident: 'Layla Ahmed',
      status: 'completed' as const,
      assignedDate: '2025-01-09',
    },
  ];

  // Filter complaints by department
  const departmentComplaints = useMemo(() => {
    if (!user?.departmentId) return [];
    return allComplaints.filter(c => c.departmentId === user.departmentId);
  }, [user?.departmentId]);

  // Recent assignments (only from their department)
  const recentAssignments = useMemo(() => {
    return departmentComplaints.slice(0, 4);
  }, [departmentComplaints]);

  // Mock staff data for queue processing
  const mockStaff = [
    {
      id: '1', userId: '1', firstName: 'John', lastName: 'Doe',
      email: 'john.doe@company.com', phone: '+971-1234567',
      departmentId: 'DEPT-001', status: 'busy' as const, activeComplaints: 5,
      maxCapacity: 5, totalAssigned: 12, pending: 5, inProgress: 5,
      completed: 2, overdue: 0, createdAt: ''
    },
    {
      id: '2', userId: '2', firstName: 'Sarah', lastName: 'Smith',
      email: 'sarah.smith@company.com', phone: '+971-1234568',
      departmentId: 'DEPT-001', status: 'available' as const, activeComplaints: 2,
      maxCapacity: 5, totalAssigned: 10, pending: 3, inProgress: 2,
      completed: 5, overdue: 0, createdAt: ''
    },
  ];

  // Get queue status for this department
  const queueStatus = useMemo(() => {
    if (!user?.departmentId) return null;
    return queueService.getQueueStatus(user.departmentId);
  }, [user?.departmentId]);

  // Handle completing a complaint - frees up staff capacity and auto-assigns from queue
  const handleCompleteComplaint = (complaintId: string) => {
    // Mark as completed
    setCompletedComplaints(prev => [...prev, complaintId]);
    
    queueService.completeComplaint(user?._id || '');
    
    if (user?.departmentId) {
      const mockStaff = [
        {
          id: '1', userId: '1', firstName: 'John', lastName: 'Doe',
          email: 'john.doe@company.com', phone: '+971-1234567',
          departmentId: 'DEPT-001', status: 'busy' as const, activeComplaints: 5,
          maxCapacity: 5, totalAssigned: 12, pending: 5, inProgress: 5,
          completed: 2, overdue: 0, createdAt: ''
        },
        {
          id: '2', userId: '2', firstName: 'Sarah', lastName: 'Smith',
          email: 'sarah.smith@company.com', phone: '+971-1234568',
          departmentId: 'DEPT-001', status: 'available' as const, activeComplaints: 2,
          maxCapacity: 5, totalAssigned: 10, pending: 3, inProgress: 2,
          completed: 5, overdue: 0, createdAt: ''
        },
      ];
      
      const assigned = queueService.processQueueForDepartment(
        user.departmentId,
        mockStaff
      );
      
      if (assigned.length > 0) {
        setCompleteSuccess(`Complaint completed! ${assigned.length} complaint(s) auto-assigned from queue.`);
        setTimeout(() => setCompleteSuccess(null), 3000);
      } else {
        setCompleteSuccess('Complaint completed!');
        setTimeout(() => setCompleteSuccess(null), 3000);
      }
    }
  };

  // Calculate stats based on department complaints
  const stats = useMemo(() => {
    const total = departmentComplaints.length;
    const inProgress = departmentComplaints.filter(c => c.status === 'in-progress').length;
    const completed = departmentComplaints.filter(c => c.status === 'completed').length;
    const pending = departmentComplaints.filter(c => c.status === 'pending').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return [
      {
        label: 'Assigned This Week',
        value: pending.toString(),
        icon: Clock,
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      {
        label: 'Completed',
        value: completed.toString(),
        icon: CheckCircle2,
        color: 'bg-blue-100',
        textColor: 'text-blue-700',
      },
      {
        label: 'In Progress',
        value: inProgress.toString(),
        icon: AlertCircle,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-700',
      },
      {
        label: 'Completion Rate',
        value: `${completionRate}%`,
        icon: Users,
        color: 'bg-purple-100',
        textColor: 'text-purple-700',
      },
    ];
  }, [departmentComplaints]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600 mt-2">
          Welcome back! Here's your work overview.
          {user?.departmentId && (
            <span className="ml-2 font-semibold text-primary-600">
              Department: {user.departmentId}
            </span>
          )}
        </p>
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

      {/* Queue Status Alert */}
      {queueStatus && queueStatus.queueLength > 0 && (
        <Card variant="md" className="p-6 border-l-4 border-yellow-400 bg-yellow-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  ⏳ Complaints Waiting in Queue
                </h3>
                <p className="text-sm text-yellow-800 mb-2">
                  {queueStatus.queueLength} complaint(s) are waiting to be assigned. 
                  Complete your current tasks to auto-assign them!
                </p>
                <p className="text-xs text-yellow-700">
                  Est. wait time: {queueStatus.averageWaitTime}
                </p>
              </div>
            </div>
            <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-900 text-sm font-bold rounded-full">
              {queueStatus.queueLength}
            </span>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {completeSuccess && (
        <Card variant="md" className="p-4 border-l-4 border-blue-400 bg-blue-50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-800 font-medium">{completeSuccess}</p>
          </div>
        </Card>
      )}

      {/* Recent Assignments */}
      <Card variant="md" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">Recent Assignments</h2>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.STAFF_ASSIGNED_COMPLAINTS)}
          >
            View All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Complaint
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Resident
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Assigned
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-secondary-900">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-secondary-900">{assignment.title}</p>
                      <p className="text-xs text-secondary-500">{assignment.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-secondary-900">{assignment.resident}</td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={completedComplaints.includes(assignment.id) ? 'Completed' : (assignment.status === 'completed' ? 'Completed' : 'In Progress')}
                      color={
                        completedComplaints.includes(assignment.id) || assignment.status === 'completed'
                          ? 'bg-blue-100'
                          : 'bg-yellow-100'
                      }
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-secondary-600">
                    {new Date(assignment.assignedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {assignment.status === 'in-progress' && !completedComplaints.includes(assignment.id) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteComplaint(assignment.id)}
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {(assignment.status === 'completed' || completedComplaints.includes(assignment.id)) && (
                      <span className="text-xs text-blue-600 font-semibold">✓ Done</span>
                    )}
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
            onClick={() => navigate(ROUTES.STAFF_ASSIGNED_COMPLAINTS)}
          >
            View Assignments
          </Button>
          <Button variant="outline" fullWidth>
            Update Status
          </Button>
          <Button variant="outline" fullWidth>
            Add Notes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StaffDashboardPage;
