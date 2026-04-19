import React from 'react';
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@components/Common';

const DepartmentPerformancePage: React.FC = () => {
  const performanceMetrics = [
    {
      title: 'Average Resolution Time',
      value: '3.2 days',
      trend: 'down',
      change: '12% faster than last month',
      icon: Clock,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      trend: 'up',
      change: '+3% from last month',
      icon: CheckCircle2,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.6/5.0',
      trend: 'up',
      change: '+0.2 from last month',
      icon: TrendingUp,
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
    },
    {
      title: 'Pending Issues',
      value: '8',
      trend: 'down',
      change: '-50% from last month',
      icon: AlertCircle,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    },
  ];

  const staffPerformance = [
    {
      name: 'John Smith',
      position: 'Senior Technician',
      assignedComplaints: 12,
      completedComplaints: 11,
      averageTime: '2.8 days',
      satisfaction: 4.8,
    },
    {
      name: 'Sarah Johnson',
      position: 'Maintenance Supervisor',
      assignedComplaints: 10,
      completedComplaints: 10,
      averageTime: '2.5 days',
      satisfaction: 4.9,
    },
    {
      name: 'Mike Wilson',
      position: 'Technician',
      assignedComplaints: 9,
      completedComplaints: 7,
      averageTime: '3.5 days',
      satisfaction: 4.4,
    },
    {
      name: 'David Brown',
      position: 'Junior Technician',
      assignedComplaints: 5,
      completedComplaints: 4,
      averageTime: '4.2 days',
      satisfaction: 4.2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Department Performance</h1>
        <p className="text-secondary-600 mt-2">Key metrics and staff performance analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} variant="md" className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-secondary-500 mb-2">{metric.title}</p>
                  <p className="text-3xl font-bold text-secondary-900">{metric.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className={`w-6 h-6 ${metric.textColor}`} />
                </div>
              </div>
              <p className={`text-xs font-medium ${
                metric.trend === 'up' ? 'text-blue-600' : 'text-blue-600'
              }`}>
                {metric.change}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Staff Performance Table */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Staff Performance Rankings</h2>
        
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
                  Avg. Time
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Rating
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance.map((staff, index) => {
                const completionRate = ((staff.completedComplaints / staff.assignedComplaints) * 100).toFixed(0);
                return (
                  <tr key={index} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{staff.name}</p>
                        <p className="text-xs text-secondary-500">{staff.position}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="font-semibold text-secondary-900">{staff.assignedComplaints}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="font-semibold text-blue-600">{staff.completedComplaints}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-secondary-900">
                      {staff.averageTime}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold text-secondary-900">{staff.satisfaction}</span>
                        <span className="text-yellow-400">★</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="w-12 h-6 bg-secondary-200 rounded-full mx-auto overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${completionRate}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-secondary-600 mt-1">{completionRate}%</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Monthly Trends (Placeholder) */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-6">Monthly Trends</h2>
        
        <div className="space-y-6">
          {/* Complaints Over Time */}
          <div>
            <h3 className="font-semibold text-secondary-900 mb-4">Complaints Filed vs Resolved</h3>
            <div className="flex items-end gap-2 h-32 bg-secondary-50 p-4 rounded-lg">
              {[65, 72, 85, 78, 92, 88, 95].map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary-600 rounded-t"
                  style={{ height: `${(value / 100) * 120}px` }}
                  title={`${value} complaints`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-secondary-500 mt-2 text-center">
              Jan • Feb • Mar • Apr • May • Jun • Jul
            </p>
          </div>

          {/* Resolution Time Trend */}
          <div>
            <h3 className="font-semibold text-secondary-900 mb-4">Average Resolution Time (Days)</h3>
            <div className="flex items-end gap-2 h-32 bg-secondary-50 p-4 rounded-lg">
              {[4.2, 3.9, 3.8, 3.5, 3.4, 3.3, 3.2].map((value, i) => (
                <div
                  key={i}
                  className="flex-1 bg-blue-600 rounded-t"
                  style={{ height: `${(value / 5) * 120}px` }}
                  title={`${value} days`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-secondary-500 mt-2 text-center">
              Jan • Feb • Mar • Apr • May • Jun • Jul
            </p>
          </div>
        </div>
      </Card>

      {/* Insights Card */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-blue-50 to-primary-50 border-primary-200">
        <h2 className="text-lg font-bold text-secondary-900 mb-4">Key Insights</h2>
        <ul className="space-y-3 text-sm text-secondary-700">
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>Average resolution time decreased by 12% compared to last month</span>
          </li>
          <li className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <span>John Smith leads team performance with 94% completion rate</span>
          </li>
          <li className="flex gap-3">
            <span className="text-yellow-600 font-bold">⚠</span>
            <span>David Brown's team needs improvement - consider mentoring program</span>
          </li>
          <li className="flex gap-3">
            <span className="text-blue-600 font-bold">ℹ</span>
            <span>Customer satisfaction trending upward - maintain current practices</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DepartmentPerformancePage;
