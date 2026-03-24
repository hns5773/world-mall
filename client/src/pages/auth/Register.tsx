import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Globe, Eye, EyeOff, Check, ChevronDown } from 'lucide-react';
import { languages } from '../../i18n';
import toast from 'react-hot-toast';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [phone, setPhone] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref') || searchParams.get('code') || '';
    if (ref) setInviteCode(ref);
  }, [searchParams]);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setAuth(data.token, data.user as any);
      toast.success(t('common.success'));
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      toast.error('Please agree to Terms of Service and Privacy Policy');
      return;
    }
    if (password !== confirmPw) {
      toast.error('Passwords do not match');
      return;
    }
    registerMutation.mutate({
      username,
      password,
      inviteCode,
      phone: phone || undefined,
      language: i18n.language,
    });
  };

  const handleChangeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('worldmall_lang', code);
    setShowLangPicker(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const filteredLangs = langSearch
    ? languages.filter(l => l.name.toLowerCase().includes(langSearch.toLowerCase()) || l.code.toLowerCase().includes(langSearch.toLowerCase()))
    : languages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4 relative">
      {/* Language Selector - Top Right Pill */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setShowLangPicker(!showLangPicker)}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-md rounded-full text-white hover:bg-white/25 transition-colors border border-white/20"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLang.code.toLowerCase()} {currentLang.code.toUpperCase()}</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {showLangPicker && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLangPicker(false)} />
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100">
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {filteredLangs.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleChangeLang(lang.code)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      i18n.language === lang.code
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="flex-1">{lang.name}</span>
                    {i18n.language === lang.code && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full max-w-md">
        {/* Globe Logo - Dark Rounded Square */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4 shadow-lg">
            <Globe className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-white">World Mall</h1>
          <p className="text-white/60 mt-1 text-sm">Premium VIP Shopping Platform</p>
        </div>

        {/* White Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('auth.registerTitle')}</h2>
          <p className="text-gray-500 mb-6 text-sm">{t('auth.registerSubtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.username')}</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                required
              />
            </div>

            {/* Phone/Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-10 text-sm"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                required
              />
            </div>

            {/* Invite Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.inviteCode')}</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                placeholder="WM-XXXXXXXX"
                required
              />
            </div>

            {/* Terms & Service Agreement */}
            <div className="flex items-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                  agreeTerms
                    ? 'bg-purple-600 border-purple-600'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
                {agreeTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <label className="text-sm text-gray-600 cursor-pointer">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Terms of Service
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={registerMutation.isLoading || !agreeTerms}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all text-sm"
            >
              {registerMutation.isLoading ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
