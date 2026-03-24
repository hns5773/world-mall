import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ShoppingCart, Check, Lock, Play, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MemberOrders() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.member.getOrders.useQuery();
  const { data: history } = trpc.member.getOrderHistory.useQuery();
  const [showHistory, setShowHistory] = useState(false);
  const [completing, setCompleting] = useState<number | null>(null);

  const completeMutation = trpc.member.completeOrder.useMutation({
    onSuccess: (result) => {
      toast.success(t('orders.orderCompleted', { amount: result.commissionEarned }));
      utils.member.getOrders.invalidate();
      utils.member.getDashboard.invalidate();
      utils.member.getOrderHistory.invalidate();
      setCompleting(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setCompleting(null);
    },
  });

  const handleComplete = (orderId: number) => {
    setCompleting(orderId);
    completeMutation.mutate({ orderId });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">{t('common.loading')}</p></div>;

  const currentIndex = data?.currentOrderIndex || 0;
  const orders = data?.orders || [];
  const balance = parseFloat(data?.balance || '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
          <p className="text-gray-500 mt-1">{t('orders.subtitle')} - VIP {data?.vipLevel || 1}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{t('dashboard.progress')}</p>
          <p className="text-lg font-bold text-primary-600">{currentIndex} / {orders.length}</p>
        </div>
      </div>

      {currentIndex >= orders.length && orders.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-emerald-800">{t('orders.allCompleted')}</p>
        </div>
      )}

      {/* Orders grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order: any) => {
          const isCompleted = order.orderIndex < currentIndex;
          const isCurrent = order.orderIndex === currentIndex;
          const isLocked = order.orderIndex > currentIndex;
          const price = parseFloat(order.price);
          const commissionAmt = price * (parseFloat(order.commissionRate) / 100);
          const canAfford = balance >= price;

          return (
            <div
              key={order.id}
              className={`card relative overflow-hidden transition-all duration-200 ${
                isCurrent ? 'ring-2 ring-primary-500 shadow-md' :
                isCompleted ? 'opacity-75' :
                'opacity-50'
              }`}
            >
              {/* Status badge */}
              <div className={`absolute top-3 right-3 ${
                isCompleted ? 'badge-approved' :
                isCurrent ? 'badge bg-primary-100 text-primary-800' :
                'badge bg-gray-100 text-gray-600'
              }`}>
                {isCompleted ? t('orders.completed') : isCurrent ? t('orders.current') : t('orders.locked')}
              </div>

              {/* Product image */}
              <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {order.productImage ? (
                  <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Order info */}
              <p className="text-xs text-gray-400 mb-1">{t('orders.orderNum', { num: order.orderIndex + 1 })}</p>
              <h3 className="font-semibold text-gray-900 mb-3 truncate">{order.productName}</h3>

              <div className="flex items-center justify-between text-sm mb-4">
                <div>
                  <p className="text-gray-500">{t('orders.price')}</p>
                  <p className="font-bold text-gray-900">${order.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">{t('orders.commission')}</p>
                  <p className="font-bold text-emerald-600">+${commissionAmt.toFixed(2)}</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-3">
                {t('orders.commissionRate')}: {order.commissionRate}%
              </div>

              {/* Action button */}
              {isCompleted && (
                <button disabled className="btn-success w-full flex items-center justify-center gap-2 opacity-60">
                  <Check className="w-4 h-4" /> {t('orders.completed')}
                </button>
              )}
              {isCurrent && (
                <button
                  onClick={() => handleComplete(order.id)}
                  disabled={!canAfford || completing === order.id}
                  className={`w-full flex items-center justify-center gap-2 font-medium py-2.5 px-5 rounded-lg transition-all ${
                    canAfford ? 'btn-gold' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {completing === order.id ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {canAfford ? t('orders.complete') : t('orders.insufficientBalance')}
                </button>
              )}
              {isLocked && (
                <button disabled className="btn-secondary w-full flex items-center justify-center gap-2 opacity-60">
                  <Lock className="w-4 h-4" /> {t('orders.locked')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Order History */}
      <div className="card">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="text-lg font-semibold text-gray-900">{t('orders.history')}</h2>
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showHistory && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">#</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.productName')}</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('orders.price')}</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('orders.commission')}</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">{t('admin.date')}</th>
                </tr>
              </thead>
              <tbody>
                {(history || []).map((h: any) => (
                  <tr key={h.id} className="border-b border-gray-50">
                    <td className="py-2 px-3">{h.orderIndex + 1}</td>
                    <td className="py-2 px-3">{h.productName}</td>
                    <td className="py-2 px-3">${h.price}</td>
                    <td className="py-2 px-3 text-emerald-600">+${h.commissionEarned}</td>
                    <td className="py-2 px-3 text-gray-400">{new Date(h.completedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!history || history.length === 0) && (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">{t('common.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
