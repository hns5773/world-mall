import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { UserPlus, Copy, Check, Users, X, ExternalLink } from 'lucide-react';
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBaseUrl = () => {
    return window.location.origin;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.subadmins')}</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> {t('admin.createSubAdmin')}
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">{t('admin.createSubAdmin')}</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ username, password }); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.username')}</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-field" required minLength={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required minLength={6} />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={createMutation.isLoading} className="btn-primary flex-1">
                  {createMutation.isLoading ? t('common.loading') : t('admin.create')}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">{t('admin.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {viewMembersSubAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Members of {viewMembersSubAdmin.username} (Invite Code: {viewMembersSubAdmin.inviteCode})
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
                      <th className="px-4 py-3 text-center font-medium text-gray-600">VIP Level</th>
                      <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-600">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {subAdminMembers.map((member: any) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{member.username}</td>
                        <td className="px-4 py-3 text-gray-500">#{member.id}</td>
                        <td className="px-4 py-3 text-right font-mono">${parseFloat(member.balance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            VIP {member.vipLevel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.isActive ? 'Active' : 'Frozen'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(subAdmins || []).map((sa: any) => {
          const registerLink = `${getBaseUrl()}/register?ref=${sa.inviteCode}`;
          const loginLink = `${getBaseUrl()}/login`;

          return (
            <div key={sa.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{sa.username}</h3>
                <span className={sa.isActive ? 'badge-approved' : 'badge-rejected'}>
                  {sa.isActive ? t('admin.active') : t('admin.inactive')}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {/* Invite Code */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('admin.inviteCode')}:</span>
                  <div className="flex items-center gap-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">{sa.inviteCode}</code>
                    <button onClick={() => copyToClipboard(sa.inviteCode, `code-${sa.id}`)} className="p-1 hover:bg-gray-100 rounded">
                      {copiedId === `code-${sa.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Register Link */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Register Link:</span>
                  <button
                    onClick={() => copyToClipboard(registerLink, `reg-${sa.id}`)}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <span className="text-xs">Copy</span>
                    {copiedId === `reg-${sa.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Login Link */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Login Link:</span>
                  <button
                    onClick={() => copyToClipboard(loginLink, `login-${sa.id}`)}
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                  >
                    <span className="text-xs">Copy</span>
                    {copiedId === `login-${sa.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Date */}
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('admin.date')}:</span>
                  <span>{new Date(sa.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* View Members button */}
              <button
                onClick={() => setViewMembersSubAdmin(sa)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                View Members
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
