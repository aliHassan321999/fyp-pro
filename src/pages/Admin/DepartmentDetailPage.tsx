import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Shield, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Card, StatusBadge } from '@components/Common';
import { useGetDepartmentsQuery } from '@/features/admin/admin.api';

const DepartmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // We'll reuse getDepartments and find the specific one for now
    // In a real app, we'd have a getDepartmentById query
    const { data: departmentsData, isLoading } = useGetDepartmentsQuery();
    const department = departmentsData?.data?.find((d: any) => d._id === id);

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!department) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Department Not Found</h2>
                <Button variant="primary" onClick={() => navigate(-1)} className="mt-6">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{department.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <StatusBadge
                            status={department.isActive ? 'Active' : 'Archived'}
                            color={department.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                        />
                        <span className="text-sm text-gray-500 font-mono">ID: {department._id.slice(-8).toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Stats */}
                <Card className="p-6 flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Staff</p>
                        <p className="text-2xl font-bold text-gray-900">{department.staffCount || 0}</p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4">
                    <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Department Head</p>
                        <p className="text-lg font-bold text-gray-900">
                            {department.headOfDepartment?.profile?.fullName || 'Not Assigned'}
                        </p>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Target SLA</p>
                        <p className="text-2xl font-bold text-gray-900">{department.slaTargetHours}h</p>
                    </div>
                </Card>
            </div>

            <Card className="p-20 text-center">
                <p className="text-gray-400 font-medium">Detailed management features (Assign Head, Assign Staff) coming soon.</p>
            </Card>
        </div>
    );
};

export default DepartmentDetailPage;
