import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { Wallet, TrendingUp, Snowflake, Crown, ShoppingCart, DollarSign } from 'lucide-react';

export default function MemberDashboard() {
  const { t } = useTranslation();
  const { data, isLoading } = trpc.member.getDashboard.useQuery();

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">{t('common.loading')}</p></div>;

  const stats = [
    { label: t('dashboard.balance'), value: `$${data?.balance || '0.00'}`, icon: Wallet, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700' },
    { label: t('dashboard.commission'), value: `$${data?.commission || '0.00'}`, icon: TrendingUp, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700' },
    { label: t('dashboard.frozen'), value: `$${data?.frozenBalance || '0.00'}`, icon: Snowflake, color: 'bg-cyan-500', lightColor: 'bg-cyan-50 text-cyan-700' },
    { label: t('dashboard.todayEarnings'), value: `$${data?.todayEarnings || '0.00'}`, icon: DollarSign, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.welcome')}!</h1>
        <p className="text-gray-500 mt-1">VIP {data?.vipLevel || 1} Member</p>
      </div>

      {/* VIP Badge */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6" />
              <span className="text-lg font-bold">{t('dashboard.vipLevel')} {data?.vipLevel || 1}</span>
            </div>
            <p className="text-white/80 text-sm">{t('dashboard.progress')}: {data?.currentOrderIndex || 0} / {data?.totalOrders || 40}</p>
            <div className="mt-3 w-64 bg-white/20 rounded-full h-2.5">
              <div
                className="bg-white rounded-full h-2.5 transition-all duration-500"
                style={{ width: `${((data?.currentOrderIndex || 0) / (data?.totalOrders || 40)) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <ShoppingCart className="w-12 h-12 text-white/30" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg ${stat.lightColor} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
