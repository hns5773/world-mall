import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Clock, TrendingDown } from 'lucide-react';

type TabType = 'overview' | 'commission' | 'history';

export default function MemberCommission() {
  const { t } = useTranslation();
  const { data, isLoading } = trpc.member.getDashboard.useQuery();
  const { data: history } = trpc.member.getOrderHistory.useQuery();
  const { data: deposits } = trpc.member.getDeposits.useQuery();
  const { data: withdrawals } = trpc.member.getWithdrawals.useQuery();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const balance = data?.balance || '0.00';
  const totalCommission = data?.commission || '0.00';
  const todayCommission = data?.todayEarnings || '0.00';

  // Calculate total earned and spent
  const totalEarned = history?.reduce((sum: number, h: any) => sum + parseFloat(h.commissionEarned || '0'), 0) || 0;
  const totalSpent = withdrawals?.reduce((sum: number, w: any) => sum + parseFloat(w.amount || '0'), 0) || 0;

  // Recent activity: combine deposits, withdrawals, commissions
  const recentActivity: any[] = [];
  if (history) {
    history.forEach((h: any) => {
      recentActivity.push({ type: 'commission', name: h.productName || `Order #${h.orderIndex + 1}`, amount: h.commissionEarned, date: h.completedAt });
    });
  }
  if (deposits) {
    deposits.forEach((d: any) => {
      recentActivity.push({ type: 'deposit', name: 'Deposit', amount: d.amount, date: d.createdAt, status: d.status });
    });
  }
  if (withdrawals) {
    withdrawals.forEach((w: any) => {
      recentActivity.push({ type: 'withdraw', name: 'Withdrawal', amount: w.amount, date: w.createdAt, status: w.status });
    });
  }
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'commission', label: 'Commission', icon: DollarSign },
    { key: 'history', label: 'History', icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with icon */}
      <div className="px-5 pt-10 pb-4 bg-white">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Commission</h1>
        </div>

        {/* 3 Colored Stat Cards */}
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* Balance - Blue */}
          <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl px-4 py-3 min-w-[120px]">
            <div className="flex items-center gap-1 mb-1">
              <Wallet className="w-3 h-3 text-white/80" />
              <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Balance</p>
            </div>
            <p className="text-white text-xl font-bold">${balance}</p>
          </div>
          {/* Total Commission - Green */}
          <div className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl px-4 py-3 min-w-[140px]">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-white/80" />
              <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Total Commission</p>
            </div>
            <p className="text-white text-xl font-bold">${totalCommission}</p>
          </div>
          {/* Today's Commission - Orange */}
          <div className="flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl px-4 py-3 min-w-[150px]">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-white/80" />
              <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">Today's Commission</p>
            </div>
            <p className="text-white text-xl font-bold">${todayCommission}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4 pb-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Total Earned / Total Spent cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mb-0.5">Total Earned</p>
                <p className="text-lg font-bold text-green-600">${totalEarned.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                </div>
                <p className="text-xs text-gray-500 mb-0.5">Total Spent</p>
                <p className="text-lg font-bold text-red-500">${totalSpent.toFixed(2)}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">No activity yet</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentActivity.slice(0, 10).map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          act.type === 'commission' ? 'bg-green-50' : act.type === 'deposit' ? 'bg-blue-50' : 'bg-red-50'
                        }`}>
                          {act.type === 'commission' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                           act.type === 'deposit' ? <ArrowUpRight className="w-4 h-4 text-blue-600" /> :
                           <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{act.name}</p>
                          <p className="text-[10px] text-gray-400">{formatDate(act.date)}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${
                        act.type === 'withdraw' ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {act.type === 'withdraw' ? '-' : '+'}${act.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Commission Tab */}
        {activeTab === 'commission' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {(!history || history.length === 0) ? (
              <div className="py-12 text-center">
                <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No commission records yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.productName || `Order #${item.orderIndex + 1}`}</p>
                        <p className="text-[10px] text-gray-400">VIP {item.vipLevel || data?.vipLevel || 1}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+${item.commissionEarned || item.commission || '0.00'}</p>
                      <p className="text-[10px] text-gray-400">{formatDate(item.completedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No history yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        act.type === 'commission' ? 'bg-green-50' : act.type === 'deposit' ? 'bg-blue-50' : 'bg-red-50'
                      }`}>
                        {act.type === 'commission' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                         act.type === 'deposit' ? <ArrowUpRight className="w-4 h-4 text-blue-600" /> :
                         <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{act.name}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(act.date)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-bold ${act.type === 'withdraw' ? 'text-red-500' : 'text-green-600'}`}>
                      {act.type === 'withdraw' ? '-' : '+'}${act.amount}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
