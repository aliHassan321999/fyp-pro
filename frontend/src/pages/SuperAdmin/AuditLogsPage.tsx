import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';
import { Button, Card } from '@components/Common';
import axios from 'axios';
import { format } from 'date-fns';

interface AuditLog {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
  targetUser?: {
    _id: string;
    email: string;
    profile?: {
      fullName: string;
    };
  };
  complaintId?: {
    _id: string;
    title: string;
  };
  departmentId?: {
    _id: string;
    name: string;
  };
  oldValue?: string;
  newValue?: string;
  metadata?: {
    from?: string;
    to?: string;
    message?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  current: number;
  limit: number;
  total: number;
  pages: number;
}

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    current: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const fetchAuditLogs = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20,
      };

      if (actionFilter) {
        params.action = actionFilter;
      }

      console.log('🔍 Fetching audit logs with params:', params);
      const response = await axios.get('/api/admin/audit-logs', { params });
      
      console.log('✅ Full API Response:', response.data);
      
      const data = response.data.data || {};
      console.log('📊 Extracted data:', data);
      console.log('📈 Total logs found:', data.logs?.length || 0);
      console.log('📄 Pagination:', data.pagination);

      if (!data.logs || data.logs.length === 0) {
        console.warn('⚠️ No logs returned! Possible reasons:');
        console.warn('   - No logs have been created yet');
        console.warn('   - Filter is too restrictive');
        console.warn('   - API returned empty array');
      }

      setLogs(data.logs || []);
      setPagination(data.pagination || {
        current: 1,
        limit: 20,
        total: 0,
        pages: 1,
      });
      setCurrentPage(page);
    } catch (error: any) {
      console.error('❌ Error fetching audit logs:', error);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', error.response.data);
      } else if (error.request) {
        console.error('   No response received:', error.request);
      } else {
        console.error('   Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Component mounted or actionFilter changed:', actionFilter);
    fetchAuditLogs(1);
  }, [actionFilter]);

  const handleExportCSV = () => {
    const headers = ['Action', 'Performed By', 'Target User', 'Complaint', 'Department', 'Date', 'Details'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        getActionLabel(log.action),
        log.performedBy?.profile?.fullName || log.performedBy?.email,
        log.targetUser?.profile?.fullName || log.targetUser?.email || '-',
        log.complaintId?.title || '-',
        log.departmentId?.name || '-',
        format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm'),
        `Old: ${log.oldValue || '-'}, New: ${log.newValue || '-'}`,
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'dd-MM-yyyy')}.csv`;
    a.click();
  };

  const toggleExpand = (logId: string) => {
    // Placeholder for compatibility
  };

  const getActionLabel = (action: string): string => {
    const actionLabelMap: { [key: string]: string } = {
      'user_login': 'User Login',
      'user_logout': 'User Logout',
      'user_approved': 'User Approved',
      'user_rejected': 'User Rejected',
      'user_reapplied': 'User Reapplied',
      'staff_created': 'Staff Created',
      'staff_assigned': 'Staff Assigned to Department',
      'staff_promoted': 'Staff Promoted',
      'staff_removed_from_department': 'Staff Removed from Department',
      'head_assigned': 'Department Head Assigned',
      'department_updated': 'Department Updated',
      'created': 'Complaint Created',
      'status_updated': 'Complaint Status Updated',
      'feedback_submitted': 'Feedback Submitted',
    };
    return actionLabelMap[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Complete audit trail for alert, incident, and response workflow actions.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchAuditLogs(currentPage)} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Filter by Action</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="All">
                <option value="">All Actions</option>
              </optgroup>
              <optgroup label="Authentication">
                <option value="user_login">User Login</option>
                <option value="user_logout">User Logout</option>
              </optgroup>
              <optgroup label="User Management">
                <option value="user_approved">User Approved</option>
                <option value="user_rejected">User Rejected</option>
                <option value="user_reapplied">User Reapplied</option>
              </optgroup>
              <optgroup label="Staff Management">
                <option value="staff_created">Staff Created</option>
                <option value="staff_assigned">Staff Assigned</option>
                <option value="staff_promoted">Staff Promoted</option>
                <option value="staff_removed_from_department">Staff Removed</option>
              </optgroup>
              <optgroup label="Department Management">
                <option value="head_assigned">Head Assigned</option>
                <option value="department_updated">Department Updated</option>
              </optgroup>
              <optgroup label="Complaint Management">
                <option value="created">Complaint Created</option>
                <option value="status_updated">Status Updated</option>
                <option value="feedback_submitted">Feedback Submitted</option>
              </optgroup>
            </select>
          </div>
          <Button
            onClick={() => {
              setActionFilter('');
              setCurrentPage(1);
            }}
            variant="outline"
          >
            Clear
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No audit logs found</p>
            <p className="text-gray-400 text-sm mt-2">
              Logs are created when users login, logout, or perform actions in the system.
            </p>
            {actionFilter && (
              <p className="text-yellow-600 text-sm mt-3">
                💡 Tip: Remove the action filter to see all types of logs
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                📊 Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} - {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} total logs
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log, index) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      AUD-{String(pagination.total - (currentPage - 1) * pagination.limit - index).padStart(3, '0')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getActionLabel(log.action)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.performedBy?.profile?.fullName || log.performedBy?.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.targetUser?.profile?.fullName || 
                       log.complaintId?.title || 
                       log.departmentId?.name || 
                       '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(log.createdAt), 'M/d/yyyy, h:mm:ss a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} logs
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchAuditLogs(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                if (pagination.pages <= 5) return i + 1;
                if (currentPage <= 3) return i + 1;
                if (currentPage >= pagination.pages - 2) return pagination.pages - 4 + i;
                return currentPage - 2 + i;
              }).map(page => (
                <button
                  key={page}
                  onClick={() => fetchAuditLogs(page)}
                  className={`w-8 h-8 rounded border transition-colors text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <Button
              onClick={() => fetchAuditLogs(currentPage + 1)}
              disabled={currentPage === pagination.pages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
