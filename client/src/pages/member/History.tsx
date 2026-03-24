import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';

export default function MemberHistory() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals'>('deposits');
  const { data: deposits, isLoading: dLoading } = trpc.member.getDeposits.useQuery();
  const { data: withdrawals, isLoading: wLoading } = trpc.member.getWithdrawals.useQuery();

  const isLoading = dLoading || wLoading;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-50 text-green-700';
      case 'rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-yellow-50 text-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return t('history.approved');
      case 'rejected': return t('history.rejected');
      default: return t('history.pending');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-6">
        <h1 className="text-white text-xl font-bold mb-4">{t('history.title')}</h1>
        
        {/* Tabs */}
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'deposits' ? 'bg-white text-purple-700 shadow-sm' : 'text-white/80'
            }`}
          >
            {t('history.deposits')}
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'withdrawals' ? 'bg-white text-purple-700 shadow-sm' : 'text-white/80'
            }`}
          >
            {t('history.withdrawals')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
            </div>
          ) : activeTab === 'deposits' ? (
            (!deposits || deposits.length === 0) ? (
              <div className="py-12 text-center">
                <ArrowDownToLine className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('history.noDeposits')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {deposits.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                        <ArrowDownToLine className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t('home.deposit')}</p>
                        <p className="text-[10px] text-gray-400">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">+${d.amount}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(d.status)}`}>
                        {getStatusLabel(d.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            (!withdrawals || withdrawals.length === 0) ? (
              <div className="py-12 text-center">
                <ArrowUpFromLine className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">{t('history.noWithdrawals')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {withdrawals.map((w: any) => (
                  <div key={w.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center">
                        <ArrowUpFromLine className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t('home.withdraw')}</p>
                        <p className="text-[10px] text-gray-400">
                          {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">-${w.amount}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStatusColor(w.status)}`}>
                        {getStatusLabel(w.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
