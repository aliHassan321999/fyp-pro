import React from 'react';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '@/features/admin/admin.api';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { Card, Button } from '@components/Common';

const AdminUserApprovalPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetPendingUsersQuery();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

  const handleApprove = async (id: string, name: string) => {
    try {
      await approveUser(id).unwrap();
      showSuccess(`Successfully approved account for ${name}`);
    } catch (error) {
      showError('Failed to approve user');
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!window.confirm('Are you strictly sure you want to REJECT and locally suspend this registration?')) return;
    
    try {
      await rejectUser({ id, reason: 'Rejected by administrator' }).unwrap();
      showSuccess(`Rejected ${name}'s application successfully`);
    } catch (error) {
      showError('Failed to safely suspend user');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
        <p className="font-bold text-slate-800">Failed to fetch securely pending queue</p>
        <Button variant="outline" onClick={refetch} className="mt-4">Retry DB Mapping</Button>
      </div>
    );
  }

  const users = data?.data || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 border-b border-slate-200 pb-4">Pending Access Queue</h1>
        <p className="text-slate-500 mt-2 font-medium">Evaluate and explicitly regulate incoming registration profiles locking your silo structure.</p>
      </div>

      {users.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center border-dashed border-2 border-slate-200 bg-slate-50 shadow-none">
          <CheckCircle className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 font-sans tracking-tight">Queue Empty</h3>
          <p className="text-slate-500">There are no pending registrations waiting for administrative action.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: any) => (
            <Card key={user._id} className="p-6 relative border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-3 pt-4">
                 <span className="bg-orange-100 text-orange-600 text-[10px] font-black tracking-widest px-2 py-1 rounded">PENDING</span>
              </div>
              
              <div className="mb-4">
                 <p className="text-xs font-black text-slate-400 tracking-widest uppercase mb-1">{user.role}</p>
                 <h3 className="text-lg font-bold text-slate-900">{user.profile?.fullName || 'No Matrix Name'}</h3>
                 <p className="text-sm text-slate-500 font-medium">{user.email}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-md mb-6 border border-slate-100">
                 <p className="text-xs text-slate-500"><span className="font-bold">CNIC:</span> {user.profile?.cnic || 'N/A'}</p>
                 <p className="text-xs text-slate-500"><span className="font-bold">Phone:</span> {user.profile?.phoneNumber || 'N/A'}</p>
              </div>

              <div className="flex items-center gap-3 w-full">
                <Button 
                  disabled={isApproving || isRejecting} 
                  onClick={() => handleApprove(user._id, user.profile?.fullName)}
                  className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm shadow-green-200"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                </Button>
                <Button 
                  variant="outline" 
                  disabled={isApproving || isRejecting} 
                  onClick={() => handleReject(user._id, user.profile?.fullName)}
                  className="flex-shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUserApprovalPage;
