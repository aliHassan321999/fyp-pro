import React, { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { Button, Card } from '@components/Common';

const SuperAdminAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');

  const complaintTrends = [
    { month: 'Jan', filed: 1250, resolved: 1180, pending: 70 },
    { month: 'Feb', filed: 1340, resolved: 1290, pending: 50 },
    { month: 'Mar', filed: 1520, resolved: 1450, pending: 70 },
    { month: 'Apr', filed: 1680, resolved: 1610, pending: 70 },
    { month: 'May', filed: 1890, resolved: 1820, pending: 70 },
    { month: 'Jun', filed: 2156, resolved: 2086, pending: 70 },
  ];

  const departmentComparisonData = [
    { dept: 'Maintenance', filed: 3200, resolved: 3008, efficiency: 94 },
    { dept: 'Infrastructure', filed: 2100, resolved: 1911, efficiency: 91 },
    { dept: 'Cleanliness', filed: 1800, resolved: 1728, efficiency: 96 },
    { dept: 'Security', filed: 1500, resolved: 1350, efficiency: 90 },
    { dept: 'Landscaping', filed: 1200, resolved: 1008, efficiency: 84 },
  ];

  const maxValue = Math.max(...complaintTrends.map((d) => d.filed));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Analytics & Insights</h1>
          <p className="text-secondary-600 mt-2">System-wide performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Select Range
          </Button>
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card variant="md" className="p-4 flex gap-2">
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
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
