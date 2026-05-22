import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, AlertCircle, Loader2, MoreVertical, Crown,
    UserPlus, Edit3, X, ChevronUp, CheckCircle2, Clock,
    AlertTriangle, UserMinus, TrendingUp, TrendingDown, Minus, Search
} from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import {
    useGetDepartmentByIdQuery,
    useGetDepartmentStaffQuery,
    useAssignHeadMutation,
    useUpdateDepartmentMutation,
    usePromoteStaffMutation,
    useRemoveStaffFromDepartmentMutation,
    useGetStaffMembersQuery,
    useAssignStaffToDepartmentMutation,
} from '@/features/admin/admin.api';
import { showSuccess, showError } from '@/utils/toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalType = 'assignHead' | 'assignStaff' | 'editDept' | 'staffProfile' | 'remove' | null;
type StaffTab = 'unassigned' | 'other';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRankColor = (rank: string) => {
    if (rank === 'senior') return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (rank === 'standard') return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-gray-50 text-gray-600 border border-gray-200';
};

const getStatusInfo = (stats: any) => {
    if ((stats?.assignedCount ?? 0) >= 5) return { label: 'Overloaded', cls: 'bg-red-50 text-red-700 border border-red-200' };
    if ((stats?.assignedCount ?? 0) > 0) return { label: 'Active', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    return { label: 'Idle', cls: 'bg-gray-50 text-gray-500 border border-gray-200' };
};

const getNextRank = (rank: string) => {
    if (rank === 'junior') return 'Standard';
    if (rank === 'standard') return 'Senior';
    return null;
};

const getSLAColor = (rate: number) => {
    if (rate >= 90) return { text: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Excellent' };
    if (rate >= 70) return { text: 'text-amber-600', bg: 'bg-amber-500', label: 'Fair' };
    return { text: 'text-red-600', bg: 'bg-red-500', label: 'Poor' };
};

const Avatar: React.FC<{ name?: string; size?: 'sm' | 'md' | 'lg' }> = ({ name, size = 'sm' }) => {
    const sizeClass = size === 'lg' ? 'w-16 h-16 text-2xl' : size === 'md' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm';
    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
            {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
};

// ─── Staff ⋮ Menu ─────────────────────────────────────────────────────────────
const ActionsMenu: React.FC<{
    staff: any;
    isHead: boolean;
    onViewProfile: () => void;
    onRemove: () => void;
}> = ({ staff, isHead, onViewProfile, onRemove }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>
            {open && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                    <button
                        onClick={() => { setOpen(false); onViewProfile(); }}
                        className="w-full px-4 py-2.5 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        View Profile
                    </button>
                    {!isHead && (
                        <button
                            onClick={() => { setOpen(false); onRemove(); }}
                            className="w-full px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                        >
                            <UserMinus className="w-4 h-4" />
                            Remove from Dept.
                        </button>
                    )}
                    {isHead && (
                        <div className="px-4 py-2.5 text-xs text-gray-400 italic">Assign new head to remove</div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Staff Profile Modal ──────────────────────────────────────────────────────
const StaffProfileModal: React.FC<{
    staff: any;
    isHead: boolean;
    deptId: string;
    onClose: () => void;
    onPromoteDone: () => void;
}> = ({ staff, isHead, deptId, onClose, onPromoteDone }) => {
    const [promoteStaff, { isLoading: promoting }] = usePromoteStaffMutation();
    const [confirmPromote, setConfirmPromote] = useState(false);

    const stats = staff?.stats || {};
    const nextRank = getNextRank(staff?.rank || 'junior');
    const slaColor = getSLAColor(stats.complianceRate ?? 0);
    const statusInfo = getStatusInfo(stats);
    const slaOnTime = Math.max(0, (stats.resolvedCount ?? 0) - (stats.slaBreaches ?? 0));

    const handlePromote = async () => {
        try {
            await promoteStaff({ userId: staff._id, deptId }).unwrap();
            showSuccess(`${staff.profile?.fullName} promoted to ${nextRank}!`);
            onPromoteDone();
            onClose();
        } catch (err: any) {
            showError(err?.data?.message || 'Promotion failed.');
        }
    };

    const statRows = [
        { label: 'Active Assignments', value: stats.assignedCount ?? 0, color: 'text-blue-600' },
        { label: 'Total Resolved', value: stats.resolvedCount ?? 0, color: 'text-emerald-600' },
        { label: 'SLA On Time', value: slaOnTime, color: 'text-emerald-600' },
        { label: 'SLA Breached', value: stats.slaBreaches ?? 0, color: 'text-red-600' },
        { label: 'Compliance Rate', value: `${stats.complianceRate ?? 0}%`, color: slaColor.text },
        { label: 'Avg Resolution', value: `${stats.avgResolutionHours ?? 0}h`, color: 'text-indigo-600' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <Card variant="lg" className="w-full max-w-lg p-0 overflow-hidden">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 py-6 relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black">
                            {staff.profile?.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white">{staff.profile?.fullName || 'Unknown'}</h2>
                                {isHead && <Crown className="w-4 h-4 text-amber-300" />}
                            </div>
                            <p className="text-blue-200 text-sm">{staff.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-white/20 text-white border border-white/30">
                                    {staff.rank || 'Junior'}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${statusInfo.cls}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="px-8 py-6">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Metrics</p>
                    <div className="grid grid-cols-2 gap-3">
                        {statRows.map(row => (
                            <div key={row.label} className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 mb-1">{row.label}</p>
                                <p className={`text-2xl font-black ${row.color}`}>{row.value}</p>
                            </div>
                        ))}
                    </div>
                    {/* SLA Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>SLA Compliance</span>
                            <span className={`font-bold ${slaColor.text}`}>{stats.complianceRate ?? 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all duration-700 ${slaColor.bg}`} style={{ width: `${Math.min(stats.complianceRate ?? 0, 100)}%` }} />
                        </div>
                    </div>
                </div>

                {/* Promote Section */}
                <div className="px-8 pb-6">
                    <div className="border-t border-gray-100 pt-5">
                        {nextRank && !confirmPromote && (
                            <>
                                <p className="text-xs text-gray-400 mb-3">Rank Management</p>
                                <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Promote to <span className="text-blue-600 capitalize">{nextRank}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 capitalize">{staff.rank || 'Junior'} → {nextRank}</p>
                                    </div>
                                    <Button variant="primary" onClick={() => setConfirmPromote(true)} className="flex items-center gap-1.5 text-sm">
                                        <ChevronUp className="w-4 h-4" /> Promote
                                    </Button>
                                </div>
                            </>
                        )}
                        {nextRank && confirmPromote && (
                            <>
                                <p className="text-sm font-semibold text-gray-800 mb-1">Confirm Promotion</p>
                                <p className="text-xs text-gray-500 mb-4">
                                    Promote <strong>{staff.profile?.fullName}</strong> from <span className="capitalize">{staff.rank || 'Junior'}</span> to <strong className="capitalize">{nextRank}</strong>? This action will be logged.
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" fullWidth onClick={() => setConfirmPromote(false)} disabled={promoting}>Cancel</Button>
                                    <Button variant="primary" fullWidth onClick={handlePromote} isLoading={promoting}>Confirm Promotion</Button>
                                </div>
                            </>
                        )}
                        {!nextRank && (
                            <p className="text-center text-xs text-gray-400">Already at highest rank (Senior)</p>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal: React.FC<{
    title: string;
    body: React.ReactNode;
    confirmLabel: string;
    isLoading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}> = ({ title, body, confirmLabel, isLoading, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <Card variant="lg" className="w-full max-w-sm p-7">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <div className="text-sm text-gray-500 mb-6">{body}</div>
            <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>Cancel</Button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 transition-all"
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {confirmLabel}
                </button>
            </div>
        </Card>
    </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const DepartmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: deptData, isLoading: deptLoading, isError: deptError } = useGetDepartmentByIdQuery(id!);
    const { data: staffData, isLoading: staffLoading, refetch: refetchStaff } = useGetDepartmentStaffQuery(id!);
    const { data: unassignedData } = useGetStaffMembersQuery({ unassigned: true });
    const { data: otherStaffData } = useGetStaffMembersQuery({});

    const department = deptData?.data;
    const staffList: any[] = staffData?.data || [];
    const unassignedStaff: any[] = unassignedData?.data || [];
    const otherStaff: any[] = (otherStaffData?.data || []).filter(
        (s: any) => s.departmentId && (s.departmentId?._id || s.departmentId) !== id
    );

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [staffTab, setStaffTab] = useState<StaffTab>('unassigned');
    const [assignSearch, setAssignSearch] = useState('');
    const [selectedAssignee, setSelectedAssignee] = useState('');
    const [editForm, setEditForm] = useState({ name: '', slaTargetHours: 24, description: '' });

    const [assignHead, { isLoading: assigningHead }] = useAssignHeadMutation();
    const [updateDept, { isLoading: updatingDept }] = useUpdateDepartmentMutation();
    const [removeStaff, { isLoading: removing }] = useRemoveStaffFromDepartmentMutation();
    const [assignStaff, { isLoading: assigningStaff }] = useAssignStaffToDepartmentMutation();

    const openEditModal = () => {
        setEditForm({ name: department?.name || '', slaTargetHours: department?.slaTargetHours || 24, description: department?.description || '' });
        setActiveModal('editDept');
    };

    const closeModal = () => { setActiveModal(null); setSelectedStaff(null); setSelectedAssignee(''); setAssignSearch(''); };

    const handleAssignHead = async () => {
        if (!selectedAssignee) return;
        try {
            await assignHead({ deptId: id!, staffId: selectedAssignee }).unwrap();
            showSuccess('Department head assigned successfully.');
            closeModal();
        } catch (err: any) { showError(err?.data?.message || 'Failed to assign head.'); }
    };

    const handleAssignStaff = async () => {
        if (!selectedAssignee) return;
        try {
            await assignStaff({ userId: selectedAssignee, departmentId: id!, currentDeptId: id! }).unwrap();
            showSuccess('Staff member added to department.');
            closeModal();
        } catch (err: any) { showError(err?.data?.message || 'Failed to assign staff.'); }
    };

    const handleEditDept = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateDept({ id: id!, data: editForm }).unwrap();
            showSuccess('Department updated successfully.');
            closeModal();
        } catch (err: any) { showError(err?.data?.message || 'Failed to update department.'); }
    };

    const handleRemove = async () => {
        try {
            await removeStaff({ userId: selectedStaff._id, deptId: id! }).unwrap();
            showSuccess(`${selectedStaff.profile?.fullName} removed from department.`);
            closeModal();
        } catch (err: any) { showError(err?.data?.message || 'Failed to remove staff.'); }
    };

    const sla = department?.slaMetrics || {};
    const headId = department?.headOfDepartment?._id?.toString();

    const modalStaffPool = staffTab === 'unassigned' ? unassignedStaff : otherStaff;
    const filteredModalStaff = modalStaffPool.filter((s: any) =>
        (s.name || s.email || '').toLowerCase().includes(assignSearch.toLowerCase())
    );

    if (deptLoading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
    );

    if (deptError || !department) return (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
            <AlertCircle className="w-16 h-16 text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900">Department Not Found</h2>
            <Button variant="primary" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );

    // ─── Stat cards data ──────────────────────────────────────────────────────
    const statCards = [
        {
            label: 'Total Staff',
            value: department.staffCount ?? 0,
            icon: <Users className="w-5 h-5" />,
            iconBg: 'bg-blue-50 text-blue-600',
            valueCls: 'text-gray-900',
        },
        {
            label: 'Total Resolved',
            value: sla.totalResolved ?? 0,
            icon: <CheckCircle2 className="w-5 h-5" />,
            iconBg: 'bg-emerald-50 text-emerald-600',
            valueCls: 'text-emerald-600',
        },
        {
            label: 'SLA Breached',
            value: sla.totalBreached ?? 0,
            icon: <AlertTriangle className="w-5 h-5" />,
            iconBg: 'bg-red-50 text-red-500',
            valueCls: 'text-red-500',
        },
        {
            label: 'SLA Target',
            value: `${department.slaTargetHours}h`,
            icon: <Clock className="w-5 h-5" />,
            iconBg: 'bg-purple-50 text-purple-600',
            valueCls: 'text-gray-900',
        },
        {
            label: 'Avg Resolution',
            value: `${sla.avgResolutionHours ?? 0}h`,
            icon: <TrendingUp className="w-5 h-5" />,
            iconBg: 'bg-indigo-50 text-indigo-600',
            valueCls: 'text-gray-900',
        },
    ];

    return (
        <div className="space-y-6 max-w-screen-xl mx-auto">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
                            <StatusBadge
                                status={department.isActive ? 'Active' : 'Archived'}
                                color={department.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}
                            />
                        </div>
                        {department.description && <p className="text-gray-500 mt-1 text-sm max-w-xl">{department.description}</p>}
                        <p className="text-xs text-gray-400 mt-1 font-mono">ID: {department._id?.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" onClick={openEditModal} className="flex items-center gap-2 text-sm">
                        <Edit3 className="w-4 h-4" /> Edit Details
                    </Button>
                    <Button variant="outline" onClick={() => setActiveModal('assignStaff')} className="flex items-center gap-2 text-sm">
                        <UserPlus className="w-4 h-4" /> Assign Staff
                    </Button>
                    <Button variant="primary" onClick={() => setActiveModal('assignHead')} className="flex items-center gap-2 text-sm">
                        <Crown className="w-4 h-4" />
                        {department.headOfDepartment ? 'Change Head' : 'Assign Head'}
                    </Button>
                </div>
            </div>

            {/* ── Stats Row (5 cards) ──────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map(card => (
                    <Card key={card.label} className="p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${card.iconBg}`}>
                            {card.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider leading-tight">{card.label}</p>
                            <p className={`text-2xl font-black mt-0.5 ${card.valueCls}`}>{card.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Staff Table — Full Width ─────────────────────────────────────── */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Staff Members</p>
                        <p className="text-xs text-gray-500 mt-0.5">{staffList.length} member{staffList.length !== 1 ? 's' : ''} in this department</p>
                    </div>
                    {/* Head info inline */}
                    {department.headOfDepartment && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <span className="hidden sm:inline">Head:</span>
                            <span className="font-semibold text-gray-700">{department.headOfDepartment?.profile?.fullName || 'Unknown'}</span>
                        </div>
                    )}
                </div>

                {staffLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : staffList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <p className="font-semibold text-gray-700">No staff assigned yet</p>
                        <p className="text-sm text-gray-400 text-center max-w-xs">Use "Assign Staff" to add people to this department.</p>
                        <Button variant="primary" onClick={() => setActiveModal('assignStaff')} className="mt-2 flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Assign Staff
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Member</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {staffList.map((staff: any) => {
                                    const isHead = staff._id?.toString() === headId;
                                    const statusInfo = getStatusInfo(staff.stats);
                                    return (
                                        <tr key={staff._id} className="hover:bg-gray-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar name={staff.profile?.fullName} />
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-semibold text-gray-900 text-sm">{staff.profile?.fullName || staff.email}</span>
                                                            {isHead && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                                                        </div>
                                                        <p className="text-xs text-gray-400">{staff.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${getRankColor(staff.rank || 'junior')}`}>
                                                    {staff.rank || 'Junior'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusInfo.cls}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ActionsMenu
                                                    staff={staff}
                                                    isHead={isHead}
                                                    onViewProfile={() => { setSelectedStaff(staff); setActiveModal('staffProfile'); }}
                                                    onRemove={() => { setSelectedStaff(staff); setActiveModal('remove'); }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* ══════════ MODALS ══════════ */}

            {/* Edit Department */}
            {activeModal === 'editDept' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card variant="lg" className="w-full max-w-md p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Department</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleEditDept} className="space-y-4">
                            <InputField label="Department Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                            <InputField label="SLA Target Hours" type="number" value={editForm.slaTargetHours} onChange={(e) => setEditForm({ ...editForm, slaTargetHours: Number(e.target.value) })} required helperText="Maximum resolution time in hours" />
                            <div>
                                <label className="label-field">Description (Optional)</label>
                                <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[90px] text-sm" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe the department's purpose..." />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" fullWidth onClick={closeModal} disabled={updatingDept}>Cancel</Button>
                                <Button type="submit" variant="primary" fullWidth isLoading={updatingDept}>Save Changes</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Assign Head */}
            {activeModal === 'assignHead' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card variant="lg" className="w-full max-w-md p-8 relative">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-gray-900">Assign Department Head</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">Select a staff member already in this department.</p>
                        {staffList.length === 0 ? (
                            <div className="py-8 text-center text-gray-400">
                                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No staff in this department yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {staffList.map((s: any) => (
                                    <label key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedAssignee === s._id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                                        <input type="radio" name="head" value={s._id} checked={selectedAssignee === s._id} onChange={() => setSelectedAssignee(s._id)} className="accent-blue-600" />
                                        <Avatar name={s.profile?.fullName} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-gray-900 truncate">
                                                {s.profile?.fullName || s.email}
                                                {s._id?.toString() === headId && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Current</span>}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRankColor(s.rank || 'junior')}`}>{s.rank || 'Junior'}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-3 mt-5">
                            <Button variant="outline" fullWidth onClick={closeModal} disabled={assigningHead}>Cancel</Button>
                            <Button variant="primary" fullWidth onClick={handleAssignHead} disabled={!selectedAssignee || assigningHead} isLoading={assigningHead}>Confirm Assignment</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Assign Staff */}
            {activeModal === 'assignStaff' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card variant="lg" className="w-full max-w-md p-8 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Assign Staff</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex border-b border-gray-100 mb-4">
                            {(['unassigned', 'other'] as StaffTab[]).map(tab => (
                                <button key={tab} onClick={() => { setStaffTab(tab); setSelectedAssignee(''); }} className={`pb-3 mr-6 text-sm font-semibold relative transition-colors ${staffTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {tab === 'unassigned' ? 'Unassigned Staff' : 'Transfer from Dept.'}
                                    {staffTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
                                </button>
                            ))}
                        </div>
                        <div className="mb-3">
                            <InputField placeholder="Search by name or email..." value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} icon={<Search className="w-4 h-4 text-gray-400" />} />
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {filteredModalStaff.length === 0 ? (
                                <div className="py-8 text-center text-gray-400 text-sm">No staff found.</div>
                            ) : filteredModalStaff.map((s: any) => (
                                <label key={s._id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedAssignee === s._id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="assignee" value={s._id} checked={selectedAssignee === s._id} onChange={() => setSelectedAssignee(s._id)} className="accent-blue-600" />
                                    <Avatar name={s.name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{s.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{staffTab === 'other' && s.departmentId?.name ? `From: ${s.departmentId.name}` : s.email}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getRankColor(s.rank || 'junior')}`}>{s.rank || 'Junior'}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3 mt-5">
                            <Button variant="outline" fullWidth onClick={closeModal} disabled={assigningStaff}>Cancel</Button>
                            <Button variant="primary" fullWidth onClick={handleAssignStaff} disabled={!selectedAssignee || assigningStaff} isLoading={assigningStaff}>Add to Department</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Staff Profile */}
            {activeModal === 'staffProfile' && selectedStaff && (
                <StaffProfileModal
                    staff={selectedStaff}
                    isHead={selectedStaff._id?.toString() === headId}
                    deptId={id!}
                    onClose={closeModal}
                    onPromoteDone={() => refetchStaff()}
                />
            )}

            {/* Remove Confirm */}
            {activeModal === 'remove' && selectedStaff && (
                <ConfirmModal
                    title="Remove from Department"
                    body={<span>Remove <strong>{selectedStaff.profile?.fullName}</strong> from this department? They will become unassigned.</span>}
                    confirmLabel="Remove"
                    isLoading={removing}
                    onConfirm={handleRemove}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default DepartmentDetailPage;
