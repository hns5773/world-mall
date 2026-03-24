import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { languages } from '../../i18n';
import toast from 'react-hot-toast';

export default function MemberSettings() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { data: profile } = trpc.auth.me.useQuery();
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const changePwMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setOldPw('');
      setNewPw('');
    },
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
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>

      {/* Profile */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.profile')}</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">{t('auth.username')}</span>
            <span className="font-medium">{profile?.username}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">{t('dashboard.vipLevel')}</span>
            <span className="font-medium">VIP {profile?.vipLevel}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">{t('admin.inviteCode')}</span>
            <span className="font-medium text-xs">{profile?.invitedBy || '-'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">{t('admin.date')}</span>
            <span className="font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.language')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChangeLang(lang.code)}
              className={`py-3 px-4 rounded-lg border-2 transition-all text-center ${
                i18n.language === lang.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl block mb-1">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.changePassword')}</h2>
        <form onSubmit={(e) => { e.preventDefault(); changePwMutation.mutate({ oldPassword: oldPw, newPassword: newPw }); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.oldPassword')}</label>
            <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.newPassword')}</label>
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="input-field" required minLength={6} />
          </div>
          <button type="submit" disabled={changePwMutation.isLoading} className="btn-primary">
            {changePwMutation.isLoading ? t('common.loading') : t('settings.changePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
