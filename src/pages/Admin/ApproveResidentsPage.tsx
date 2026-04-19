import React, { useState } from 'react';
import { useGetPendingUsersQuery, useApproveUserMutation, useRejectUserMutation } from '@/features/admin/admin.api';
import { Search, CheckCircle2, XCircle, Loader2, UserCheck, UserX, Clock, ShieldAlert, User, Phone, MapPin, FileText, Calendar } from 'lucide-react';
import { Button, Card, InputField } from '@/components/Common';

export const AdminApproveResidentsPage: React.FC = () => {
  const { data, isLoading } = useGetPendingUsersQuery(undefined, { pollingInterval: 30000 });
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();
  const [rejectUser, { isLoading: isRejecting }] = useRejectUserMutation();

  const [searchTerm, setSearchTerm] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingUsers = data?.data || [];

  const filteredUsers = pendingUsers.filter((user: any) =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.profile?.cnic?.includes(searchTerm)
  );

  const handleApprove = async (id: string) => {
    try {
      await approveUser(id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const openRejectModal = (id: string) => {
    setSelectedRejectId(id);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (selectedRejectId) {
      try {
        await rejectUser({ id: selectedRejectId, reason: rejectReason }).unwrap();
        setIsRejectModalOpen(false);
        setSelectedRejectId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const cancelReject = () => {
    setIsRejectModalOpen(false);
    setSelectedRejectId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resident Approvals</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Review and verify resident accounts before granting access.</p>
        </div>
      </div>

      {/* STATS PANELS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Pending Approvals</p>
            <h2 className="text-3xl font-black text-yellow-900 mt-1">{pendingUsers.length}</h2>
          </div>
          <div className="bg-yellow-200/50 p-3 rounded-full shadow-inner">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl shadow-sm flex items-center justify-between opacity-70">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Accounts</p>
            <h2 className="text-3xl font-black text-emerald-900 mt-1">--</h2>
            <p className="text-[10px] text-emerald-600 font-bold tracking-wide">View Analytics Panel</p>
          </div>
          <div className="bg-emerald-200/50 p-3 rounded-full">
            <UserCheck className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 p-4 rounded-xl shadow-sm flex items-center justify-between opacity-70">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">Rejected Accounts</p>
            <h2 className="text-3xl font-black text-rose-900 mt-1">--</h2>
            <p className="text-[10px] text-rose-600 font-bold tracking-wide">View Analytics Panel</p>
          </div>
          <div className="bg-rose-200/50 p-3 rounded-full">
            <UserX className="w-6 h-6 text-rose-600" />
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card variant="md" className="p-3 border-slate-200 shadow-sm">
        <InputField
          placeholder="Search by Resident Name, Email, or CNIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </Card>

      {/* QUEUE */}
      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <ShieldAlert className="w-10 h-10 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-500 drop-shadow-sm">No Pending Approvals</h3>
            <p className="text-slate-400 mt-1 text-sm font-medium tracking-wide">The verification queue is currently empty.</p>
          </div>
        ) : (
          filteredUsers.map((user: any) => (
            <Card key={user._id} className="relative p-6 overflow-hidden border-slate-200 hover:border-blue-300 transition-colors shadow-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-400" />

              <div className="flex flex-col gap-6 pl-2">
                {/* Top Row: User Profile & Action Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-full border border-blue-100 shadow-sm mt-1">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{user.profile?.fullName || 'Resident'}</h3>
                      <p className="text-blue-600 font-medium text-sm tracking-wide mb-2.5">{user.email}</p>
                      <span className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg bg-slate-50 shadow-sm w-fit flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-3 min-w-[260px]">
                    <Button
                      onClick={() => handleApprove(user._id)}
                      disabled={isApproving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base py-3 px-5 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-1.5 inline-block" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openRejectModal(user._id)}
                      disabled={isRejecting}
                      className="flex-1 hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-base py-3 px-5 transition-all"
                    >
                      <XCircle className="w-5 h-5 mr-1.5 inline-block" /> Reject
                    </Button>
                  </div>
                </div>

                {/* Bottom Row: Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-5">
                  <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100 flex flex-col shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <FileText className="w-4 h-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">CNIC</p>
                    </div>
                    <p className="text-slate-900 font-black text-base pl-6">{user.profile?.cnic || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100 flex flex-col shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <Phone className="w-4 h-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Phone</p>
                    </div>
                    <p className="text-slate-900 font-black text-base pl-6">{user.profile?.phone || 'N/A'}</p>
                  </div>

                  <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-100 flex flex-col shadow-inner">
                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <p className="text-xs font-bold uppercase tracking-wider">Resident Unit</p>
                    </div>
                    <p className="text-slate-900 font-black text-base pl-6 truncate">{`Unit ${user.profile?.houseNumber || '0'}, Block ${user.profile?.block || 'A'}`}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* INTERNAL CUSTOM MODAL OVERLAY */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
          <Card className="w-full max-w-md p-6 border-none shadow-2xl relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 text-red-600">
                <div className="bg-red-100 p-2 rounded-full">
                  <XCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">Reject Application</h2>
              </div>
              <button onClick={cancelReject} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <p className="text-slate-600 text-sm mb-5 mt-2">
              Are you certain you want to reject this resident's registration application? You can optionally provide a reason for the rejection below.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Rejection Reason <span className="text-slate-400 font-normal italic">(Optional)</span></label>
              <textarea
                rows={3}
                placeholder="Ex: Invalid CNIC, conflicting unit details..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-medium text-slate-800 shadow-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={cancelReject} disabled={isRejecting} className="border-slate-300 text-slate-700 font-bold hover:bg-slate-100">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReject}
                disabled={isRejecting}
                className="font-bold bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                {isRejecting ? 'Rejecting...' : 'Yes, Reject Resident'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminApproveResidentsPage;
