import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Users, CreditCard, Wallet, Clock, ArrowDownToLine, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data, isLoading } = trpc.admin.getDashboard.useQuery();

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">{t('common.loading')}</p></div>;

  const stats = [
    { label: t('dashboard.totalUsers'), value: data?.totalUsers || 0, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: t('dashboard.totalDeposits'), value: `$${data?.totalDeposits || '0.00'}`, icon: CreditCard, color: 'bg-emerald-50 text-emerald-700' },
    { label: t('dashboard.totalWithdrawals'), value: `$${data?.totalWithdrawals || '0.00'}`, icon: Wallet, color: 'bg-purple-50 text-purple-700' },
    { label: t('dashboard.pendingDeposits'), value: data?.pendingDeposits || 0, icon: Clock, color: 'bg-amber-50 text-amber-700' },
    { label: t('dashboard.pendingWithdrawals'), value: data?.pendingWithdrawals || 0, icon: ArrowDownToLine, color: 'bg-red-50 text-red-700' },
    { label: t('dashboard.newUsersToday'), value: data?.todayNewUsers || 0, icon: UserPlus, color: 'bg-cyan-50 text-cyan-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.welcome')}, {user?.username}!</h1>
        <p className="text-gray-500 mt-1 capitalize">{user?.role} Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
