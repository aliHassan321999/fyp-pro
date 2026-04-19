import React, { useState } from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import { Button, Card } from '@components/Common';

const SuperAdminReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const availableReports = [
    {
      id: '1',
      title: 'Monthly Performance Report',
      description: 'Comprehensive overview of all departments and complexes',
      frequency: 'Monthly',
      lastGenerated: '2025-01-20',
      format: 'PDF, Excel',
    },
    {
      id: '2',
      title: 'Complaint Analysis Report',
      description: 'Detailed analysis of complaints by category and resolution',
      frequency: 'Weekly',
      lastGenerated: '2025-01-21',
      format: 'PDF, Excel',
    },
    {
      id: '3',
      title: 'Staff Performance Report',
      description: 'Individual and departmental staff metrics and ratings',
      frequency: 'Monthly',
      lastGenerated: '2025-01-20',
      format: 'PDF, Excel',
    },
    {
      id: '4',
      title: 'Financial Summary Report',
      description: 'Budget allocation and expenditure tracking',
      frequency: 'Quarterly',
      lastGenerated: '2025-01-15',
      format: 'PDF, Excel',
    },
    {
      id: '5',
      title: 'Resident Satisfaction Report',
      description: 'Survey results and satisfaction metrics',
      frequency: 'Monthly',
      lastGenerated: '2025-01-19',
      format: 'PDF, Excel',
    },
    {
      id: '6',
      title: 'System Health Report',
      description: 'IT infrastructure and system performance metrics',
      frequency: 'Weekly',
      lastGenerated: '2025-01-21',
      format: 'PDF, Excel',
    },
  ];

  const customReportTemplates = [
    { id: 'custom1', name: 'Date Range Comparison', description: 'Compare metrics across custom date ranges' },
    { id: 'custom2', name: 'Department Drill Down', description: 'Deep dive into specific department data' },
    { id: 'custom3', name: 'Resident Experience', description: 'Feedback and satisfaction analysis' },
    { id: 'custom4', name: 'Resource Utilization', description: 'Staff and equipment usage analysis' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Reports & Exports</h1>
        <p className="text-secondary-600 mt-2">Generate and download system reports</p>
      </div>

      {/* Standard Reports */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Standard Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableReports.map((report) => (
            <Card
              key={report.id}
              variant="md"
              className={`p-6 cursor-pointer transition-all ${
                selectedReport === report.id ? 'ring-2 ring-primary-500' : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-secondary-900">{report.title}</h3>
                  <p className="text-sm text-secondary-600 mt-1">{report.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-secondary-500">
                    <span>📅 {report.frequency}</span>
                    <span>Updated: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {selectedReport === report.id && (
                <div className="mt-4 pt-4 border-t border-secondary-200 space-y-3">
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" fullWidth className="flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="sm" fullWidth className="flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" fullWidth>
                    Email Report
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Report Generator */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Create Custom Report</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Report Type
              </label>
              <select className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Performance Overview</option>
                <option>Complaint Analysis</option>
                <option>Staff Metrics</option>
                <option>Financial Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Date Range
              </label>
              <select className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last Quarter</option>
                <option>Custom Range</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Include Departments
              </label>
              <select multiple className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>All Departments</option>
                <option>Maintenance</option>
                <option>Infrastructure</option>
                <option>Cleanliness</option>
                <option>Security</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-900 mb-2">
                Report Format
              </label>
              <select className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>JSON</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth>
              Reset
            </Button>
            <Button variant="primary" fullWidth className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Templates */}
      <div>
        <h2 className="text-xl font-bold text-secondary-900 mb-4">Quick Report Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {customReportTemplates.map((template) => (
            <Card key={template.id} variant="md" className="p-6">
              <h3 className="font-bold text-secondary-900 mb-2">{template.name}</h3>
              <p className="text-sm text-secondary-600 mb-4">{template.description}</p>
              <Button variant="outline" fullWidth size="sm">
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <Card variant="md" className="p-6">
        <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Scheduled Reports
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div>
              <p className="font-medium text-secondary-900">Monthly Performance Report</p>
              <p className="text-sm text-secondary-600">Every 1st of the month at 12:00 AM</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div>
              <p className="font-medium text-secondary-900">Weekly Complaint Analysis</p>
              <p className="text-sm text-secondary-600">Every Monday at 9:00 AM</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg border border-secondary-200">
            <div>
              <p className="font-medium text-secondary-900">Weekly System Health Check</p>
              <p className="text-sm text-secondary-600">Every Friday at 6:00 PM</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </div>

        <Button variant="outline" fullWidth className="mt-4 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          Schedule New Report
        </Button>
      </Card>
    </div>
  );
};

export default SuperAdminReportsPage;
