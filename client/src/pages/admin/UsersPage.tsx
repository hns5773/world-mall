import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Search, Edit2, Save, X, Key } from 'lucide-react';
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

  const updateMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setEditingId(null);
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

  const filtered = (users || []).filter((u: any) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (user: any) => {
    setEditingId(user.id);
    setEditData({ balance: user.balance, vipLevel: user.vipLevel, isActive: user.isActive, currentOrderIndex: user.currentOrderIndex });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.users')}</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search')}
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

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('auth.username')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('dashboard.balance')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">VIP</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Order#</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.status')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.inviteCode')}</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4">{u.id}</td>
                  <td className="py-3 px-4 font-medium">{u.username}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${u.role === 'owner' ? 'bg-purple-100 text-purple-800' : u.role === 'subadmin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {editingId === u.id ? (
                      <input type="text" value={editData.balance} onChange={(e) => setEditData({ ...editData, balance: e.target.value })} className="input-field py-1 px-2 w-24" />
                    ) : (
                      `$${u.balance}`
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === u.id ? (
                      <input type="number" value={editData.vipLevel} onChange={(e) => setEditData({ ...editData, vipLevel: parseInt(e.target.value) })} className="input-field py-1 px-2 w-16" />
                    ) : (
                      u.vipLevel
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === u.id ? (
                      <input type="number" value={editData.currentOrderIndex} onChange={(e) => setEditData({ ...editData, currentOrderIndex: parseInt(e.target.value) })} className="input-field py-1 px-2 w-16" />
                    ) : (
                      u.currentOrderIndex
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === u.id ? (
                      <select value={editData.isActive ? 'true' : 'false'} onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })} className="input-field py-1 px-2 w-20">
                        <option value="true">{t('admin.active')}</option>
                        <option value="false">{t('admin.inactive')}</option>
                      </select>
                    ) : (
                      <span className={u.isActive ? 'badge-approved' : 'badge-rejected'}>
                        {u.isActive ? t('admin.active') : t('admin.inactive')}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-xs">{u.invitedBy || u.inviteCode || '-'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {editingId === u.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(u)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setResetPwId(u.id)} className="p-1.5 hover:bg-amber-50 rounded text-amber-600"><Key className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
