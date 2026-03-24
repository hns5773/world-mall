import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { TrendingUp, DollarSign } from 'lucide-react';

export default function MemberCommission() {
  const { t } = useTranslation();
  const { data, isLoading } = trpc.member.getDashboard.useQuery();
  const { data: history } = trpc.member.getOrderHistory.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8">
        <h1 className="text-white text-xl font-bold mb-4">{t('commission.title')}</h1>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">{t('commission.totalCommission')}</p>
            <p className="text-white text-2xl font-bold">${data?.commission || '0.00'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">{t('commission.todayCommission')}</p>
            <p className="text-white text-2xl font-bold">${data?.todayEarnings || '0.00'}</p>
          </div>
        </div>
      </div>

      {/* Commission History */}
      <div className="px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">{t('commission.history')}</h2>
          </div>

          {(!history || history.length === 0) ? (
            <div className="py-12 text-center">
              <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t('commission.noRecords')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.productName || `Order #${item.orderIndex}`}</p>
                      <p className="text-[10px] text-gray-400">VIP {item.vipLevel || data?.vipLevel || 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+${item.commissionEarned || item.commission || '0.00'}</p>
                    <p className="text-[10px] text-gray-400">
                      {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
