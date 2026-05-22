import React, { useState } from 'react';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { Card, Button } from '@components/Common';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';

interface ReportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: string[];
}

const SuperAdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('month');

  const reports: ReportOption[] = [
    {
      id: 'complaint-report',
      title: '📋 Complaint Report',
      description: 'Comprehensive analysis of all complaints filed, resolved, and pending across all departments',
      icon: '📊',
      fields: ['Total Complaints', 'Resolved', 'Pending', 'Average Resolution Time', 'Department-wise Breakdown'],
    },
    {
      id: 'department-report',
      title: '🏢 Department Report',
      description: 'Performance metrics for each department including efficiency, SLA compliance, and team performance',
      icon: '📈',
      fields: ['Department Performance', 'Staff Count', 'Complaints Handled', 'Resolution Rate', 'SLA Compliance'],
    },
    {
      id: 'staff-report',
      title: '👥 Staff Performance Report',
      description: 'Individual staff member performance metrics and efficiency ratings',
      icon: '⭐',
      fields: ['Staff Name', 'Complaints Resolved', 'Average Time', 'Efficiency Rating', 'Department'],
    },
  ];

  const handleGenerateReport = (reportId: string) => {
    alert(`📄 Generating ${reports.find(r => r.id === reportId)?.title}...\n\nReport will be ready for download shortly!`);
    // In a real implementation, this would call an API to generate the report
  };

    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.SUPERADMIN_DASHBOARD)}
          className="p-2 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-secondary-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Generate Reports</h1>
          <p className="text-secondary-600 mt-1">Create comprehensive system and performance reports</p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card variant="md" className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-center gap-4">
          <label className="font-medium text-secondary-900">Select Date Range:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </Card>

      {/* Report Options */}
      <div className="grid grid-cols-1 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            variant="md"
            className={`p-6 cursor-pointer transition-all border-l-4 ${
              selectedReport === report.id
                ? 'border-l-blue-500 ring-2 ring-blue-200 bg-blue-50'
                : 'border-l-secondary-300 hover:border-l-blue-400'
            }`}
            onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Info */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-bold text-secondary-900 mb-2">{report.title}</h3>
                <p className="text-secondary-600 mb-4">{report.description}</p>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-secondary-900 mb-2">Report includes:</p>
                  <div className="flex flex-wrap gap-2">
                    {report.fields.map((field, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white border border-secondary-200 text-secondary-700 text-xs rounded-full"
                      >
                        ✓ {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-end lg:items-center justify-end lg:justify-center">
                <Button
                  variant="primary"
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => handleGenerateReport(report.id)}
                >
                  <Download className="w-4 h-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedReport === report.id && (
              <div className="mt-4 pt-4 border-t border-secondary-200">
                <p className="text-sm text-secondary-600">
                  <span className="font-semibold">Format:</span> PDF, Excel, CSV
                </p>
                <p className="text-sm text-secondary-600 mt-2">
                  <span className="font-semibold">Frequency:</span> Generated on-demand
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Export Options */}
      <Card variant="md" className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
        <h3 className="text-lg font-bold text-secondary-900 mb-4">📥 Quick Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-shadow text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <p className="text-sm font-medium text-secondary-900">Export All Data</p>
            <p className="text-xs text-secondary-600 mt-1">CSV Format</p>
          </button>
          <button className="p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-shadow text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <p className="text-sm font-medium text-secondary-900">Monthly Summary</p>
            <p className="text-xs text-secondary-600 mt-1">PDF Format</p>
          </button>
          <button className="p-4 bg-white border border-secondary-200 rounded-lg hover:shadow-md transition-shadow text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="text-sm font-medium text-secondary-900">System Health</p>
            <p className="text-xs text-secondary-600 mt-1">Excel Format</p>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminReportsPage;
