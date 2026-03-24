import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { UserPlus, Copy, Check, Users, X, Edit2, Link as LinkIcon, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubAdminsPage() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data: subAdmins } = trpc.admin.getSubAdmins.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // View Members modal state
  const [viewMembersSubAdmin, setViewMembersSubAdmin] = useState<any>(null);

  // Edit Login modal state
  const [editLoginSubAdmin, setEditLoginSubAdmin] = useState<any>(null);
  const [newLoginPassword, setNewLoginPassword] = useState('');

  const { data: subAdminMembers, isLoading: membersLoading } = trpc.admin.getSubAdminMembers.useQuery(
    { subAdminId: viewMembersSubAdmin?.id },
    { enabled: !!viewMembersSubAdmin }
  );

  const createMutation = trpc.admin.createSubAdmin.useMutation({
    onSuccess: (data) => {
      toast.success(`Created! Invite code: ${data.inviteCode}`);
      setShowCreate(false);
      setUsername('');
      setPassword('');
      utils.admin.getSubAdmins.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const resetPwMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success('Password updated');
      setEditLoginSubAdmin(null);
      setNewLoginPassword('');
    },
    onError: (err) => toast.error(err.message),
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBaseUrl = () => window.location.origin;

  // Also include the owner in the list
  const allAdmins = subAdmins || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sub-Admins</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Create Sub-Admin
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Create Sub-Admin</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ username, password }); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" required minLength={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required minLength={6} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={createMutation.isLoading} className="btn-primary flex-1">
                  {createMutation.isLoading ? 'Creating...' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Login modal */}
      {editLoginSubAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Login - {editLoginSubAdmin.username}</h3>
              <button onClick={() => setEditLoginSubAdmin(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="text" value={newLoginPassword} onChange={(e) => setNewLoginPassword(e.target.value)} className="input-field mb-4" placeholder="Enter new password" minLength={6} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => resetPwMutation.mutate({ userId: editLoginSubAdmin.id, newPassword: newLoginPassword })}
                disabled={!newLoginPassword || newLoginPassword.length < 6}
                className="btn-primary flex-1"
              >
                Update Password
              </button>
              <button onClick={() => setEditLoginSubAdmin(null)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersSubAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Members of {viewMembersSubAdmin.username} (Code: {viewMembersSubAdmin.inviteCode})
              </h3>
              <button onClick={() => setViewMembersSubAdmin(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-auto flex-1">
              {membersLoading ? (
                <div className="text-center py-8 text-gray-500">Loading members...</div>
              ) : subAdminMembers && subAdminMembers.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">UID</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-600">Balance</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">VIP</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subAdminMembers.map((member: any) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{member.username}</td>
                        <td className="px-4 py-3 text-gray-500">#{member.id}</td>
                        <td className="px-4 py-3 text-right font-mono">${parseFloat(member.balance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">VIP {member.vipLevel}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {member.isActive ? 'Active' : 'Frozen'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{new Date(member.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8 text-gray-500">No members registered yet</div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
              Total: {subAdminMembers?.length || 0} members
            </div>
          </div>
        </div>
      )}

      {/* Sub-Admins Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Username</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Invite Code</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Created At</th>
                <th className="text-left py-3 px-4 text-gray-500 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allAdmins.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No sub-admins yet</td></tr>
              ) : (
                allAdmins.map((sa: any) => {
                  const registerLink = `${getBaseUrl()}/register?ref=${sa.inviteCode}`;
                  const loginLink = `${getBaseUrl()}/login`;

                  return (
                    <tr key={sa.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{sa.username}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sa.role === 'owner' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sa.role === 'owner' ? 'owner' : 'admin'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{sa.email || '—'}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <code className="text-xs font-mono text-gray-700">{sa.inviteCode}</code>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              onClick={() => copyToClipboard(registerLink, `reg-${sa.id}`)}
                              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              <LinkIcon className="w-3 h-3" />
                              Register Link
                            </button>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => copyToClipboard(loginLink, `login-${sa.id}`)}
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <LinkIcon className="w-3 h-3" />
                              Login Link
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(sa.createdAt).toLocaleString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => setViewMembersSubAdmin(sa)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Users className="w-3 h-3" />
                            View Members
                          </button>
                          <button
                            onClick={() => {
                              // Navigate to settings page for this admin's deposit addresses
                              toast.success('Navigate to Settings to edit addresses');
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit Addresses
                          </button>
                          <button
                            onClick={() => setEditLoginSubAdmin(sa)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                          >
                            <Key className="w-3 h-3" />
                            Edit Login
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
