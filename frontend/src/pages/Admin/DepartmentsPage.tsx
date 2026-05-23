import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Users, Loader2, AlertCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button, Card, InputField, StatusBadge } from '@components/Common';
import { useGetDepartmentsQuery, useCreateDepartmentMutation } from '@/features/admin/admin.api';
import { showSuccess, showError } from '@/utils/toast';
import { ROUTES } from '@constants/index';

const AdminDepartmentsPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Form and Validation State
    const [form, setForm] = useState({
        name: '',
        slaTargetHours: 24,
        description: ''
    });
    const [errors, setErrors] = useState<{ name?: string; slaTargetHours?: string; description?: string }>({});

    // Refs for Focus
    const nameInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const { data: departmentsData, isLoading, isError, refetch } = useGetDepartmentsQuery();
    const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation();

    const departments = departmentsData?.data || [];

    // Filtering Logic (Tab + Search)
    const filteredDepartments = departments.filter((dept: any) => {
        const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = 
            activeTab === 'all' || 
            (activeTab === 'active' && dept.isActive) || 
            (activeTab === 'archived' && !dept.isActive);
        return matchesSearch && matchesTab;
    });

    // Pagination (Frontend slicing as requested)
    const ITEMS_PER_PAGE = 8;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
    const paginatedDepartments = filteredDepartments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Modal Handlers
    useEffect(() => {
        if (showCreateModal) {
            setTimeout(() => nameInputRef.current?.focus(), 100);
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape' && !isCreating) handleCloseModal();
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [showCreateModal, isCreating]);

    const handleCloseModal = () => {
        if (isCreating) return;
        setShowCreateModal(false);
        setForm({ name: '', slaTargetHours: 24, description: '' });
        setErrors({});
    };

    const handleOutsideClick = (e: React.MouseEvent) => {
        if (modalRef.current === e.target && !isCreating) handleCloseModal();
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (!form.name.trim()) newErrors.name = 'Department name is required';
        const slaNum = Number(form.slaTargetHours);
        if (!Number.isFinite(slaNum) || slaNum <= 0) newErrors.slaTargetHours = 'SLA must be positive';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCreating || !validateForm()) return;

        try {
            await createDepartment({
                name: form.name.trim(),
                slaTargetHours: Number(form.slaTargetHours),
                description: form.description.trim()
            }).unwrap();
            showSuccess('Department created successfully');
            handleCloseModal();
            refetch();
        } catch (err: any) {
            showError(err?.data?.message || 'Failed to create department');
        }
    };

    const handleRowClick = (id: string) => {
        navigate(ROUTES.ADMIN_DEPARTMENT_DETAIL.replace(':id', id));
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Departments</h1>
                    <p className="text-gray-500 mt-1">Manage organizational units and leadership assignments across the company.</p>
                </div>
                <Button variant="primary" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Department
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-8 border-b border-gray-100 pb-0">
                {(['all', 'active', 'archived'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                        className={`pb-4 text-sm font-semibold transition-all relative ${
                            activeTab === tab 
                            ? 'text-blue-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'all' ? 'Departments' : ''}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <Card className="overflow-hidden border-gray-100 shadow-sm">
                <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 tracking-wider">
                        <span>DEPARTMENT LIST</span>
                    </div>
                    <div className="w-64">
                        <InputField
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<Search className="w-4 h-4 text-gray-400" />}
                            className="bg-white border-gray-200 h-9 text-xs"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Department Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Head of Department</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Members</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedDepartments.map((dept: any) => (
                                <tr 
                                    key={dept._id} 
                                    onClick={() => handleRowClick(dept._id)}
                                    className="group hover:bg-gray-50/50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900">{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {dept.headOfDepartment ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                        {dept.headOfDepartment.profile?.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{dept.headOfDepartment.profile?.fullName}</span>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-300 italic text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <span>Unassigned</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className="text-[13px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                                            {dept.staffCount || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <StatusBadge
                                            status={dept.isActive ? 'Active' : 'Archived'}
                                            color={dept.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}
                                        />
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="text-blue-600 font-bold text-sm hover:underline">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {paginatedDepartments.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">
                                        {isError ? 'Failed to sync with registry.' : 'No departments mapped to this scope.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500 font-medium bg-gray-50/20">
                        <span>
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredDepartments.length)} of {filteredDepartments.length} departments
                        </span>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 border border-gray-200 rounded hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 border border-gray-200 rounded hover:bg-white disabled:opacity-30 transition-all shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create Modal */}
            {showCreateModal && (
                <div 
                    ref={modalRef}
                    onClick={handleOutsideClick}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                >
                    <Card variant="lg" className="w-full max-w-md p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Create New Department</h2>
                            <button onClick={handleCloseModal} disabled={isCreating} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-5">
                            <InputField
                                label="Department Name"
                                placeholder="e.g. Maintenance"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                error={errors.name}
                                ref={nameInputRef}
                                required
                            />

                            <InputField
                                label="SLA Target Hours"
                                type="number"
                                value={form.slaTargetHours}
                                onChange={(e) => setForm({ ...form, slaTargetHours: Number(e.target.value) })}
                                error={errors.slaTargetHours}
                                required
                                helperText="Maximum resolution time in hours"
                            />

                            <div>
                                <label className="label-field">Description (Optional)</label>
                                <textarea
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none min-h-[100px] border-gray-300`}
                                    placeholder="Describe the department's purpose..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button variant="outline" fullWidth onClick={handleCloseModal} disabled={isCreating}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" fullWidth isLoading={isCreating}>
                                    Save Department
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminDepartmentsPage;
