import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ShoppingCart, Check, Lock, Play, AlertCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

type TabType = 'order' | 'pending' | 'completed';

export default function MemberOrders() {
  const { t } = useTranslation();
  const utils = trpc.useContext();
  const { data, isLoading } = trpc.member.getOrders.useQuery();
  const { data: history } = trpc.member.getOrderHistory.useQuery();
  const [activeTab, setActiveTab] = useState<TabType>('order');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const currentIndex = data?.currentOrderIndex || 0;
  const orders = data?.orders || [];
  const balance = parseFloat(data?.balance || '0');

  // Categorize orders
  const currentOrder = orders.find((o: any) => o.orderIndex === currentIndex);
  // Pending orders: only those that are started but not completed (orderIndex < currentIndex)
  // This means orders that have been started but the member hasn't completed yet
  const pendingOrders = orders.filter((o: any) => o.orderIndex < currentIndex && !history?.find((h: any) => h.vipOrderId === o.id));
  const completedOrders = history || [];
  const allCompleted = currentIndex >= orders.length && orders.length > 0;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'order', label: 'Order', count: currentOrder && !allCompleted ? 1 : 0 },
    { key: 'pending', label: 'Pending', count: pendingOrders.length },
    { key: 'completed', label: 'Completed', count: completedOrders.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex flex-wrap items-center justify-center gap-8 p-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Globe key={i} className="w-12 h-12 text-white" />
          ))}
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-white text-xl font-bold">{t('orders.title')}</h1>
          <p className="text-white/70 text-sm mt-1">VIP {data?.vipLevel || 1} - {currentIndex}/{orders.length} {t('orders.completed')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 -mt-3 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-1 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1 ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 pb-6">
        {/* Order Tab - Current Active Order */}
        {activeTab === 'order' && (
          <div>
            {allCompleted ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-semibold text-emerald-800 mb-2">{t('orders.allCompleted')}</p>
                <p className="text-sm text-gray-500">All orders for your VIP level have been completed.</p>
              </div>
            ) : currentOrder ? (
              <div className="space-y-4">
                {/* Sequence enforcement notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700">Each order must be completed before proceeding to the next order. Orders cannot be skipped or bypassed.</p>
                </div>

                {/* Current Order Card */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden ring-2 ring-purple-500">
                  <div className="relative h-48 bg-gray-100">
                    {currentOrder.productImage ? (
                      <img src={currentOrder.productImage} alt={currentOrder.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {t('orders.current')}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-xs opacity-80">Order #{currentOrder.orderIndex + 1}</p>
                      <h3 className="text-white text-lg font-bold">{currentOrder.productName}</h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">{t('orders.price')}</p>
                        <p className="text-sm font-bold text-gray-900">${currentOrder.price}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">Rate</p>
                        <p className="text-sm font-bold text-purple-600">{currentOrder.commissionRate}%</p>
                      </div>
                      <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">{t('orders.commission')}</p>
                        <p className="text-sm font-bold text-emerald-600">
                          +${(parseFloat(currentOrder.price) * (parseFloat(currentOrder.commissionRate) / 100)).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    {balance >= parseFloat(currentOrder.price) ? (
                      <button
                        onClick={() => handleComplete(currentOrder.id)}
                        disabled={completing === currentOrder.id}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
                      >
                        {completing === currentOrder.id ? (
                          <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        {t('orders.complete')}
                      </button>
                    ) : (
                      <div>
                        <button disabled className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                          <Lock className="w-5 h-5" />
                          {t('orders.insufficientBalance')}
                        </button>
                        <p className="text-xs text-center text-gray-400 mt-2">
                          Balance: ${balance.toFixed(2)} / Required: ${currentOrder.price}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active orders</p>
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No pending orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Sequence enforcement notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">These orders are locked. Complete your current order first to unlock the next one.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingOrders.map((order: any) => {
                    const price = parseFloat(order.price);
                    const commissionAmt = price * (parseFloat(order.commissionRate) / 100);
                    return (
                      <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden opacity-60">
                        <div className="flex gap-3 p-3">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            {order.productImage ? (
                              <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] text-gray-400">#{order.orderIndex + 1}</p>
                              <span className="bg-gray-100 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Lock className="w-3 h-3" /> {t('orders.locked')}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{order.productName}</h3>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-gray-600">${order.price}</span>
                              <span className="text-xs text-emerald-600">+${commissionAmt.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Tab */}
        {activeTab === 'completed' && (
          <div>
            {completedOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <Check className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No completed orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((h: any) => (
                  <div key={h.id} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{h.productName}</h3>
                      <p className="text-[10px] text-gray-400">
                        Order #{h.orderIndex + 1} • {new Date(h.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-500">${h.price}</p>
                      <p className="text-sm font-bold text-emerald-600">+${h.commissionEarned}</p>
                    </div>
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
