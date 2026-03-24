import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { languages } from '../../i18n';
import toast from 'react-hot-toast';
import { User, Globe, Lock, LogOut, ChevronRight, Copy, Check, MessageCircle, FileText, X, Shield, Key, Wallet, CreditCard, Clock, UserCog, Crown, Info } from 'lucide-react';

export default function MemberSettings() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile, refetch: refetchProfile } = trpc.auth.me.useQuery();
  const { data: dashboard } = trpc.member.getDashboard.useQuery();
  const [copied, setCopied] = useState(false);

  // Modal states
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showFundPassword, setShowFundPassword] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // Security form
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [langSearch, setLangSearch] = useState('');

  // Profile edit form
  const [editUsername, setEditUsername] = useState('');

  const changePwMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => { toast.success(t('common.success')); setOldPw(''); setNewPw(''); setShowChangePassword(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { toast.success(t('common.success')); refetchProfile(); setShowProfileEdit(false); },
    onError: (err: any) => toast.error(err.message),
  });

  const handleChangeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('worldmall_lang', code);
    updateProfileMutation.mutate({ language: code });
    setShowLangPicker(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const copyInviteCode = () => {
    if (profile?.invitedBy) {
      navigator.clipboard.writeText(profile.invitedBy);
      setCopied(true);
      toast.success(t('deposit.copied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const filteredLangs = langSearch 
    ? languages.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.code.toLowerCase().includes(langSearch.toLowerCase()))
    : languages;

  const balance = dashboard?.balance || '0.00';
  const vipLevel = profile?.vipLevel || user?.vipLevel || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Profile Section */}
      <div className="bg-white px-5 pt-10 pb-5">
        <div className="flex items-center gap-4">
          {/* Blue Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <button 
              onClick={() => { setEditUsername(profile?.username || ''); setShowProfileEdit(true); }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
            >
              <UserCog className="w-2.5 h-2.5 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">{profile?.username || user?.username}</h2>
              <button 
                onClick={() => { setEditUsername(profile?.username || ''); setShowProfileEdit(true); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <UserCog className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-gray-400">UID: {profile?.uid || '-'}</p>
              <button onClick={() => { navigator.clipboard.writeText(String(profile?.uid || '')); toast.success('Copied!'); }}>
                <Copy className="w-3 h-3 text-gray-300" />
              </button>
            </div>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                <Crown className="w-3 h-3" />
                VIP{vipLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Row */}
      <div className="bg-white px-5 pb-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900">${balance}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/deposit')}
              className="px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 transition-colors"
            >
              Deposit
            </button>
            <button 
              onClick={() => navigate('/withdraw')}
              className="px-5 py-2 bg-white text-gray-700 text-sm font-semibold rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Invite Code Card */}
      <div className="px-4 mt-4">
        <div className="bg-blue-50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Invite Code</p>
              <p className="text-sm font-bold text-blue-600">{profile?.invitedBy || '-'}</p>
            </div>
          </div>
          {profile?.invitedBy && (
            <button onClick={copyInviteCode} className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
          )}
        </div>
      </div>

      {/* SETTINGS Header */}
      <div className="px-5 mt-6 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</p>
      </div>

      {/* Menu Items */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Edit Profile */}
          <button 
            onClick={() => { setEditUsername(profile?.username || ''); setShowProfileEdit(true); }}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Edit Profile</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Change Password */}
          <button 
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Key className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Fund Password */}
          <button 
            onClick={() => setShowFundPassword(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                <Wallet className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Fund Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Withdrawal Address */}
          <button 
            onClick={() => navigate('/withdraw')}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Withdrawal Address</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Language */}
          <button 
            onClick={() => setShowLangPicker(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Language</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{currentLang.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </button>

          {/* Transaction History */}
          <button 
            onClick={() => navigate('/history')}
            className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-teal-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Transaction History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          {/* Customer Service */}
          <button 
            onClick={() => navigate('/chat')}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-pink-500" />
              </div>
              <span className="text-sm font-medium text-gray-800">Customer Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* About Us */}
      <div className="px-4 pb-3">
        <button 
          onClick={() => navigate('/about')}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <Info className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-800">About Us</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
      </div>

      {/* Logout Button */}
      <div className="px-4 pb-8">
        <button 
          onClick={handleLogout}
          className="w-full py-3.5 rounded-2xl border border-red-200 bg-white text-red-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLangPicker(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Language</h3>
              <button onClick={() => setShowLangPicker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 py-2">
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-3 pb-4">
              <div className="grid grid-cols-2 gap-1">
                {filteredLangs.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleChangeLang(lang.code)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-xs font-medium truncate">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowChangePassword(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
              <button onClick={() => setShowChangePassword(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={(e) => { e.preventDefault(); changePwMutation.mutate({ oldPassword: oldPw, newPassword: newPw }); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
                  <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required minLength={6} />
                </div>
                <button type="submit" disabled={changePwMutation.isLoading} 
                  className="w-full py-3 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors">
                  {changePwMutation.isLoading ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Fund Password Modal */}
      {showFundPassword && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowFundPassword(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Fund Password</h3>
              <button onClick={() => setShowFundPassword(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="text-center py-6">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Fund password protects your withdrawals</p>
                <p className="text-xs text-gray-400 mt-1">Contact support to set up your fund password</p>
              </div>
              <button 
                onClick={() => { setShowFundPassword(false); navigate('/chat'); }}
                className="w-full py-3 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowProfileEdit(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowProfileEdit(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ username: editUsername }); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                  <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required />
                </div>
                <button type="submit" disabled={updateProfileMutation.isLoading} 
                  className="w-full py-3 bg-blue-500 text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-colors">
                  {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
