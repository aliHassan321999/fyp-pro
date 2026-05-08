import React, { useState } from 'react';
import { Search, Download, TrendingUp, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Button, Card, InputField } from '@components/Common';
import { useAuth } from '@hooks/useAuth';
import { useGetDepartmentStaffQuery } from '@/features/department/department.api';
import { showError } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/index';

const DepartmentStaffPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'resolved' | 'compliance' | 'assigned' | 'sla'>('resolved');
  const { user } = useAuth();

  const { data: staffResponse, isLoading, isError } = useGetDepartmentStaffQuery(
    user?.departmentId || ''
  );

  const staff = staffResponse?.data || [];

  const filteredStaff = staff
    .filter((member: any) =>
      member.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      switch (sortBy) {
        case 'resolved':
          return (b.stats?.resolvedCount || 0) - (a.stats?.resolvedCount || 0);
        case 'compliance':
          return (b.stats?.complianceRate || 0) - (a.stats?.complianceRate || 0);
        case 'assigned':
          return (b.stats?.assignedCount || 0) - (a.stats?.assignedCount || 0);
        case 'sla':
          return (a.stats?.slaBreaches || 0) - (b.stats?.slaBreaches || 0);
        default:
          return 0;
      }
    });

  const generateAllStaffReport = () => {
    const report = {
      title: 'Staff Performance Report',
      date: new Date().toLocaleDateString(),
      departmentId: user?.departmentId,
      totalStaff: staff.length,
      staffDetails: staff.map((member: any) => ({
        name: member.profile?.fullName,
        email: member.email,
        rank: member.rank,
        status: member.accountStatus,
        assigned: member.stats?.assignedCount || 0,
        resolved: member.stats?.resolvedCount || 0,
        compliance: member.stats?.complianceRate || 0,
        slaBreaches: member.stats?.slaBreaches || 0,
      }))
    };

    const csv = [
      ['Staff Performance Report', new Date().toLocaleDateString()],
      [],
      ['Name', 'Email', 'Rank', 'Status', 'Assigned', 'Resolved', 'Compliance %', 'SLA Breaches'],
      ...report.staffDetails.map(s => [
        s.name,
        s.email,
        s.rank,
        s.status,
        s.assigned,
        s.resolved,
        s.compliance.toFixed(2),
        s.slaBreaches
      ])
    ]
      .map(row => row.join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `staff-performance-report-${Date.now()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading staff performance data...</p>
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load staff data</h3>
        <p className="text-slate-500 text-center">Unable to retrieve staff performance information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Staff Performance Analytics</h1>
          <p className="text-secondary-600 mt-2">{filteredStaff.length} staff members</p>
        </div>
        <Button
          variant="primary"
          onClick={generateAllStaffReport}
          icon={<Download className="w-4 h-4" />}
        >
          Export All Report
        </Button>
      </div>

      {/* Search and Sort */}
      <Card variant="md" className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="resolved">Sort by: Resolved ↓</option>
              <option value="assigned">Sort by: Assigned ↓</option>
              <option value="compliance">Sort by: Compliance ↓</option>
              <option value="sla">Sort by: SLA Breaches ↑</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="md" className="p-6 border-l-4 border-l-green-500">
          <div className="text-sm text-secondary-600 mb-1">Total Staff</div>
          <div className="text-3xl font-bold text-secondary-900">{staff.length}</div>
        </Card>
        <Card variant="md" className="p-6 border-l-4 border-l-blue-500">
          <div className="text-sm text-secondary-600 mb-1">Avg Resolved</div>
          <div className="text-3xl font-bold text-secondary-900">
            {staff.length > 0 
              ? Math.round(
                  staff.reduce((sum: number, s: any) => sum + (s.stats?.resolvedCount || 0), 0) / 
                  staff.length
                )
              : 0}
          </div>
        </Card>
        <Card variant="md" className="p-6 border-l-4 border-l-purple-500">
          <div className="text-sm text-secondary-600 mb-1">Avg Compliance</div>
          <div className="text-3xl font-bold text-secondary-900">
            {staff.length > 0
              ? (
                  staff.reduce((sum: number, s: any) => sum + (s.stats?.complianceRate || 0), 0) /
                  staff.length
                ).toFixed(1)
              : 0}
            %
          </div>
        </Card>
        <Card variant="md" className="p-6 border-l-4 border-l-red-500">
          <div className="text-sm text-secondary-600 mb-1">Total SLA Breaches</div>
          <div className="text-3xl font-bold text-secondary-900">
            {staff.reduce((sum: number, s: any) => sum + (s.stats?.slaBreaches || 0), 0)}
          </div>
        </Card>
      </div>

      {/* Staff Performance Table */}
      <div className="space-y-3">
        {filteredStaff.length === 0 ? (
          <Card variant="md" className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <p className="text-secondary-600">No staff members found</p>
          </Card>
        ) : (
          filteredStaff.map((member: any) => (
            <Card key={member._id} variant="md" className="p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                {/* Staff Info */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-secondary-900">
                    {member.profile?.fullName}
                  </h3>
                  <p className="text-xs text-secondary-500 mt-1">{member.email}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded capitalize">
                      {member.rank || 'Staff'}
                    </span>
                  </div>
                </div>

                {/* Assigned */}
                <div className="text-center">
                  <p className="text-xs text-secondary-500 mb-1">Assigned</p>
                  <p className="text-2xl font-bold text-secondary-900">
                    {member.stats?.assignedCount || 0}
                  </p>
                </div>

                {/* Resolved */}
                <div className="text-center">
                  <p className="text-xs text-secondary-500 mb-1">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {member.stats?.resolvedCount || 0}
                  </p>
                </div>

                {/* Compliance */}
                <div className="text-center">
                  <p className="text-xs text-secondary-500 mb-1">Compliance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(member.stats?.complianceRate || 0).toFixed(1)}%
                  </p>
                </div>

                {/* SLA Breaches */}
                <div className="text-center">
                  <p className="text-xs text-secondary-500 mb-1">SLA Breaches</p>
                  <p className={`text-2xl font-bold ${(member.stats?.slaBreaches || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {member.stats?.slaBreaches || 0}
                  </p>
                </div>

                {/* Actions */}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.DEPARTMENT_STAFF_DETAIL.replace(':id', member._id))}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentStaffPerformancePage;
