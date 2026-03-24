import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Search, Edit2, Save, X, Plus, Minus, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data: users, isLoading } = trpc.admin.getUsers.useQuery();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [resetPwId, setResetPwId] = useState<number | null>(null);
  const [newPw, setNewPw] = useState('');
  const [viewUser, setViewUser] = useState<any>(null);

  // Balance adjustment modal
  const [balanceModal, setBalanceModal] = useState<{ userId: number; username: string; mode: 'add' | 'reduce' } | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  const updateMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setEditingId(null);
      setBalanceModal(null);
      setBalanceAmount('');
      utils.admin.getUsers.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetPwMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setResetPwId(null);
      setNewPw('');
    },
    onError: (err) => toast.error(err.message),
  });

  const filtered = (users || []).filter((u: any) => {
    if (u.role !== 'member') return false;
    const q = search.toLowerCase();
    return u.username.toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      String(u.id).includes(q);
  });

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditData({
      balance: user.balance,
      vipLevel: user.vipLevel,
      isActive: user.isActive,
      currentOrderIndex: user.currentOrderIndex,
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateMutation.mutate({
      userId: editingId,
      balance: editData.balance,
      vipLevel: editData.vipLevel,
      isActive: editData.isActive,
      currentOrderIndex: editData.currentOrderIndex,
    });
  };

  const handleBalanceAdjust = () => {
    if (!balanceModal || !balanceAmount) return;
    const user = (users || []).find((u: any) => u.id === balanceModal.userId);
    if (!user) return;
    const current = parseFloat(user.balance);
    const adj = parseFloat(balanceAmount);
    if (isNaN(adj) || adj <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const newBal = balanceModal.mode === 'add' ? current + adj : Math.max(0, current - adj);
    updateMutation.mutate({
      userId: balanceModal.userId,
      balance: newBal.toFixed(2),
    });
  };

  const toggleActive = (user: any) => {
    updateMutation.mutate({
      userId: user.id,
      isActive: !user.isActive,
    });
  };

  // Generate a 6-digit UID from the user ID
  const getUID = (id: number) => {
    const hash = ((id * 2654435761) >>> 0) % 900000 + 100000;
    return hash;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input-field pl-10 w-64"
          />
        </div>
      </div>

      {/* Reset password modal */}
      {resetPwId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">{t('admin.resetPassword')}</h3>
            <input
              type="text"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder={t('admin.newPassword')}
              className="input-field mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => resetPwMutation.mutate({ userId: resetPwId, newPassword: newPw })} className="btn-primary flex-1">
                {t('admin.save')}
              </button>
              <button onClick={() => { setResetPwId(null); setNewPw(''); }} className="btn-secondary flex-1">
                {t('admin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance adjustment modal */}
      {balanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              {balanceModal.mode === 'add' ? '+ Add Balance' : '− Reduce Balance'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">User: {balanceModal.username}</p>
            <input
              type="number"
              step="0.01"
              min="0"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
              placeholder="Enter amount"
              className="input-field mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleBalanceAdjust}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${balanceModal.mode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {balanceModal.mode === 'add' ? 'Add' : 'Reduce'}
              </button>
              <button onClick={() => { setBalanceModal(null); setBalanceAmount(''); }} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View user modal */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button onClick={() => setViewUser(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">UID</span><span className="font-medium">{getUID(viewUser.id)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Username</span><span className="font-medium">{viewUser.username}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone / Email</span><span className="font-medium">{viewUser.phone || viewUser.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className="font-medium text-emerald-600">${viewUser.balance}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="font-medium">${viewUser.commission}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Frozen Balance</span><span className="font-medium">${viewUser.frozenBalance}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VIP Level</span><span className="font-medium text-orange-600">VIP{viewUser.vipLevel}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Order Index</span><span className="font-medium">{viewUser.currentOrderIndex}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Invite Code</span><span className="font-medium">{viewUser.inviteCode || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Referred By</span><span className="font-medium">{viewUser.invitedBy || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={viewUser.isActive ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>{viewUser.isActive ? 'Active' : 'Frozen'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Created</span><span className="font-medium">{new Date(viewUser.createdAt).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setViewUser(null)} className="btn-primary w-full mt-4">Close</button>
          </div>
        </div>
      )}

      {/* Edit user modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit User</h3>
              <button onClick={() => setEditingId(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Balance</label>
                <input type="text" value={editData.balance} onChange={(e) => setEditData({ ...editData, balance: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VIP Level</label>
                <input type="number" value={editData.vipLevel} onChange={(e) => setEditData({ ...editData, vipLevel: parseInt(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Index</label>
                <input type="number" value={editData.currentOrderIndex} onChange={(e) => setEditData({ ...editData, currentOrderIndex: parseInt(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editData.isActive ? 'true' : 'false'} onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })} className="input-field">
                  <option value="true">Active</option>
                  <option value="false">Frozen</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveEdit} className="btn-primary flex-1">Save</button>
              <button onClick={() => setEditingId(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">UID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Username</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Phone / Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Balance</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">VIP Level</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Referred By</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-gray-400">No data available</td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{getUID(u.id)}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{u.username}</td>
                    <td className="py-3 px-4 text-gray-600">{u.phone || u.email || '—'}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">${u.balance}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-orange-700 bg-orange-50">
                        VIP{u.vipLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{u.invitedBy || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        {u.isActive ? 'Active' : 'Frozen'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {/* Edit button */}
                        <button
                          onClick={() => startEdit(u)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        {/* Add balance */}
                        <button
                          onClick={() => setBalanceModal({ userId: u.id, username: u.username, mode: 'add' })}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                        {/* Reduce balance */}
                        <button
                          onClick={() => setBalanceModal({ userId: u.id, username: u.username, mode: 'reduce' })}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                          Reduce
                        </button>
                        {/* View */}
                        <button
                          onClick={() => setViewUser(u)}
                          className="inline-flex items-center p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Active/Freeze toggle */}
                        <button
                          onClick={() => toggleActive(u)}
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                            u.isActive
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-red-700 bg-red-50 hover:bg-red-100'
                          }`}
                        >
                          {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          {u.isActive ? 'Active' : 'Freeze'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
