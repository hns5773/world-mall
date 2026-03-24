import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { languages } from '../../i18n';
import toast from 'react-hot-toast';
import { User, Shield, Globe, Lock, LogOut, ChevronRight, Copy, Check } from 'lucide-react';

export default function MemberSettings() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile } = trpc.auth.me.useQuery();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  const changePwMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => { toast.success(t('common.success')); setOldPw(''); setNewPw(''); setShowPwSection(false); },
    onError: (err) => toast.error(err.message),
  });

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => toast.success(t('common.success')),
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
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8">
        <h1 className="text-white text-xl font-bold">{t('myself.title')}</h1>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
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
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">{t('myself.uid')}</span>
              <span className="text-sm font-medium text-gray-900">{profile?.uid || '-'}</span>
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

        {/* Language Selector */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowLangPicker(!showLangPicker)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-900">{t('myself.language')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{currentLang.flag} {currentLang.name}</span>
              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showLangPicker ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {showLangPicker && (
            <div className="border-t border-gray-100">
              {/* Search */}
              <div className="px-4 py-2">
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="max-h-72 overflow-y-auto px-2 pb-2">
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
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <button 
            onClick={() => setShowPwSection(!showPwSection)}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-900">{t('myself.changePassword')}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showPwSection ? 'rotate-90' : ''}`} />
          </button>

          {showPwSection && (
            <div className="border-t border-gray-100 p-5">
              <form onSubmit={(e) => { e.preventDefault(); changePwMutation.mutate({ oldPassword: oldPw, newPassword: newPw }); }} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('myself.oldPassword')}</label>
                  <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t('myself.newPassword')}</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-field" required minLength={6} />
                </div>
                <button type="submit" disabled={changePwMutation.isLoading} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity">
                  {changePwMutation.isLoading ? t('common.loading') : t('myself.changePassword')}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <button 
          onClick={() => navigate('/chat')}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-900">{t('myself.contactSupport')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">{t('myself.logout')}</span>
        </button>
      </div>
    </div>
  );
}
