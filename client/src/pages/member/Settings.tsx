import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { languages } from '../../i18n';
import toast from 'react-hot-toast';
import { User, Globe, Lock, LogOut, ChevronRight, Copy, Check, Users, MessageCircle, FileText, Camera, X, Shield, Bell, HelpCircle } from 'lucide-react';

export default function MemberSettings() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile, refetch: refetchProfile } = trpc.auth.me.useQuery();
  const [copied, setCopied] = useState(false);

  // Modal states
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  // Security form
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [langSearch, setLangSearch] = useState('');

  // Profile edit form
  const [editUsername, setEditUsername] = useState('');

  const changePwMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => { toast.success(t('common.success')); setOldPw(''); setNewPw(''); setShowSecurity(false); },
    onError: (err) => toast.error(err.message),
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => { toast.success(t('common.success')); refetchProfile(); setShowProfileEdit(false); },
    onError: (err) => toast.error(err.message),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex flex-wrap items-center justify-center gap-8 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Globe key={i} className="w-12 h-12 text-white" />
          ))}
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-white text-xl font-bold">{t('myself.title')}</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <button 
                onClick={() => { setEditUsername(profile?.username || ''); setShowProfileEdit(true); }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200"
              >
                <Camera className="w-3 h-3 text-gray-600" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900">{profile?.username || user?.username}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  VIP {profile?.vipLevel || user?.vipLevel || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* UID at top */}
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('myself.uid')}</span>
              <span className="text-sm font-bold text-purple-600">{profile?.uid || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('myself.inviteCode')}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{profile?.invitedBy || '-'}</span>
                {profile?.invitedBy && (
                  <button onClick={copyInviteCode} className="text-blue-500 hover:text-blue-700">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('myself.phone')}</span>
              <span className="text-sm font-medium text-gray-900">{profile?.phone || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">{t('myself.memberSince')}</span>
              <span className="text-sm font-medium text-gray-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Language */}
          <button 
            onClick={() => setShowLangPicker(true)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">{t('myself.language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{currentLang.flag} {currentLang.name}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>

          {/* Security */}
          <button 
            onClick={() => setShowSecurity(true)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Security</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Team */}
          <button 
            onClick={() => setShowTeam(true)}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Team</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Service */}
          <button 
            onClick={() => navigate('/chat')}
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Service</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Notifications */}
          <button 
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Account Verification */}
          <button 
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Account Verification</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Help & FAQ */}
          <button 
            className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">Help & FAQ</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* About Us */}
          <button 
            onClick={() => navigate('/about')}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-900">About Us</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t('myself.logout')}</span>
        </button>
      </div>

      {/* Language Picker Modal */}
      {showLangPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLangPicker(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{t('myself.language')}</h3>
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

      {/* Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSecurity(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Security</h3>
              <button onClick={() => setShowSecurity(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={(e) => { e.preventDefault(); changePwMutation.mutate({ oldPassword: oldPw, newPassword: newPw }); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('myself.oldPassword')}</label>
                  <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('myself.newPassword')}</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" required minLength={6} />
                </div>
                <button type="submit" disabled={changePwMutation.isLoading} 
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                  {changePwMutation.isLoading ? t('common.loading') : t('myself.changePassword')}
                </button>
              </form>
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
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); updateProfileMutation.mutate({ username: editUsername }); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                  <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} 
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" required />
                </div>
                <button type="submit" disabled={updateProfileMutation.isLoading} 
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
                  {updateProfileMutation.isLoading ? t('common.loading') : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeam && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTeam(false)} />
          <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Team</h3>
              <button onClick={() => setShowTeam(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-purple-800 mb-1">Your Invite Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-purple-600">{profile?.invitedBy || '-'}</span>
                  {profile?.invitedBy && (
                    <button onClick={copyInviteCode} className="text-purple-500 hover:text-purple-700">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Share your invite code to grow your team</p>
                <p className="text-xs text-gray-400 mt-1">Team members will appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
