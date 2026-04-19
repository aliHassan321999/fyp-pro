import React, { useEffect, useState, useMemo } from 'react';
import { useGetAnalyticsQuery } from '@/features/admin/admin.api';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Clock, Percent, Zap, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/Common';

export const AdminDashboard: React.FC = () => {
  const [filterType, setFilterType] = useState<'7D'|'30D'|'90D'|'Custom'>('30D');

  // Initialize bounds dynamically
  const defaultPast = new Date();
  defaultPast.setDate(defaultPast.getDate() - 30);
  
  const [startDate, setStartDate] = useState<string>(defaultPast.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Memoization prevents cyclical React renders bounding the request natively
  const params = useMemo(() => ({ startDate, endDate }), [startDate, endDate]);
  const { data, isLoading, isError } = useGetAnalyticsQuery(params);
  
  useEffect(() => {
    if (data) {
      console.log('[AdminAnalytics Debug] Full API Response:', data);
    }
  }, [data]);

  const handleFilterClick = (type: '7D'|'30D'|'90D'|'Custom') => {
    setFilterType(type);
    if (type !== 'Custom') {
      const now = new Date();
      const past = new Date();
      past.setDate(now.getDate() - (type === '7D' ? 7 : type === '30D' ? 30 : 90));
      
      setStartDate(past.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl border border-red-200">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
        <p className="font-bold text-red-800">Failed to securely construct Global Analytics</p>
      </div>
    );
  }

  const { overview = {}, slaMetrics = {}, trends = [], departments = [], staff = [] } = data.data || {};

  // Compute total SLA Breached (Resolved + Pending)
  const totalBreaches = (slaMetrics.slaBreachedResolved || 0) + (slaMetrics.slaBreachedPending || 0);

  // KPIs tightly bounded
  const kpis = [
    { title: 'Total Registered', value: overview.totalComplaints || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Successfully Resolved', value: overview.resolvedComplaints || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Active Pending', value: overview.pendingComplaints || 0, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { title: 'SLA Breached', value: totalBreaches, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    { title: 'Avg Speed', value: `${overview.avgResolutionTimeHours || 0} hrs`, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { 
      title: 'SLA Compliance Rate', 
      value: `${slaMetrics.slaComplianceRate || 0}%`, 
      icon: Percent, 
      color: (slaMetrics.slaComplianceRate || 0) >= 90 ? 'text-emerald-600' : 'text-rose-600', 
      bg: (slaMetrics.slaComplianceRate || 0) >= 90 ? 'bg-emerald-100' : 'bg-rose-100' 
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 border-b-0 pb-0 drop-shadow-sm">Executive Analytics</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time global metrics aggregating strict compliance and execution rates.</p>
        </div>

        {/* Temporal Filters - Premium Glassmorphism UI */}
        <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-2 md:mt-0">
          
          <div className="flex items-center bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm p-1 rounded-full relative">
            {(['7D', '30D', '90D', 'Custom'] as const).map(type => (
              <button
                key={type}
                onClick={() => handleFilterClick(type)}
                className={`relative px-5 py-2 text-sm font-black rounded-full transition-all duration-300 ease-out focus:outline-none ${
                  filterType === type 
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105 z-10' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 z-0'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Animated Target Data Picker Dropdown */}
          <div 
            className={`flex items-center gap-2 transition-all duration-500 ease-out origin-top ${
              filterType === 'Custom' 
              ? 'opacity-100 scale-100 h-[44px] pointer-events-auto' 
              : 'opacity-0 scale-95 h-0 overflow-hidden pointer-events-none'
            }`}
          >
            <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-lg pr-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all hover:border-blue-300">
              <div className="bg-blue-50 p-1.5 rounded-md ml-1.5 mr-1">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="text-sm px-2 py-1 bg-transparent text-slate-800 outline-none font-bold cursor-pointer" 
              />
            </div>

            <span className="text-slate-300 font-black">→</span>

            <div className="flex items-center bg-white border border-slate-200 shadow-sm rounded-lg pr-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all hover:border-blue-300">
              <div className="bg-orange-50 p-1.5 rounded-md ml-1.5 mr-1">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="text-sm px-2 py-1 bg-transparent text-slate-800 outline-none font-bold cursor-pointer" 
              />
            </div>
          </div>

        </div>
      </div>

      {/* No Data Safety Check */}
      {overview.totalComplaints === 0 && (
        <div className="w-full bg-blue-50 text-blue-600 p-4 rounded-xl border border-blue-100 flex items-center justify-center font-bold tracking-wide">
          No operational data explicitly logged within the currently selected temporal period.
        </div>
      )}

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg}`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpi.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
            </div>
          </Card>
        ))}
      </div>

      {/* Temporal Line Chart */}
      <Card className="p-6 w-full h-[400px]">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-2">Logistical Inflow Modeling</h3>
        {trends.length === 0 ? (
          <div className="flex h-full items-center justify-center text-slate-400 font-bold">No timeline matrices available to plot structurally.</div>
        ) : (
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
              />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tabular Matrices */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Departments */}
        <Card className="p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Department Execution Matrix</h3>
          <div className="overflow-x-auto">
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold p-4 text-center">No Department logs natively mapped.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3 rounded-tl-lg">Department Unit</th>
                    <th className="p-3 text-center">Total Load</th>
                    <th className="p-3 text-center text-red-600">Breached</th>
                    <th className="p-3 text-center font-bold text-indigo-500">Avg Speed</th>
                    <th className="p-3 text-center rounded-tr-lg">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept: any, i: number) => (
                    <tr key={dept._id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-800">{dept.departmentName || 'Unassigned Core'}</td>
                      <td className="p-3 text-center font-bold">{dept.totalComplaints || 0}</td>
                      <td className="p-3 text-center text-red-500 font-bold">{dept.slaBreached || 0}</td>
                      <td className="p-3 text-center text-indigo-500 font-bold text-xs">{dept.avgResolutionTimeHours ? `${dept.avgResolutionTimeHours} hrs` : 'N/A'}</td>
                      <td className={`p-3 text-center font-black ${dept.complianceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {dept.complianceRate || 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        {/* Staff Metrics */}
        <Card className="p-6 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Staff SLA Metrics</h3>
          <div className="overflow-x-auto">
            {staff.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold p-4 text-center">No Staff execution blocks identified.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-3 rounded-tl-lg">Staff Member</th>
                    <th className="p-3 text-center">Assigned Load</th>
                    <th className="p-3 text-center text-red-600">Breaches</th>
                    <th className="p-3 text-center font-bold text-indigo-500">Avg Speed</th>
                    <th className="p-3 text-center rounded-tr-lg">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((usr: any, i: number) => (
                    <tr key={usr._id || i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <p className="font-semibold text-slate-800">{usr.staffName || 'Unknown Operator'}</p>
                      </td>
                      <td className="p-3 text-center font-bold text-indigo-600">{usr.assignedCount || 0}</td>
                      <td className="p-3 text-center font-bold text-red-500">{usr.slaBreaches || 0}</td>
                      <td className="p-3 text-center text-indigo-500 font-bold text-xs">{usr.avgResolutionTimeHours ? `${usr.avgResolutionTimeHours} hrs` : 'N/A'}</td>
                      <td className={`p-3 text-center font-black ${usr.complianceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {usr.complianceRate || 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
