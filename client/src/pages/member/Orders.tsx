import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '../../utils/trpc';
import { ShoppingCart, Check, Lock, Zap, Crown } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  const currentIndex = data?.currentOrderIndex || 0;
  const orders = data?.orders || [];
  const balance = parseFloat(data?.balance || '0');
  const vipLevel = data?.vipLevel || 0;

  const completedOrders = history || [];
  const allCompleted = currentIndex >= orders.length && orders.length > 0;
  const progressPercent = orders.length > 0 ? Math.min((currentIndex / orders.length) * 100, 100) : 0;

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'order', label: 'Order List', count: orders.length },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'completed', label: 'Completed', count: completedOrders.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-gray-50">
      {/* Header - White with green tint */}
      <div className="bg-white px-5 pt-10 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Order Center</h1>
          </div>
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Crown className="w-3 h-3" />
            VIP{vipLevel}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">{currentIndex}/{orders.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Balance: ${balance.toFixed(2)}</span>
            <span>{progressPercent.toFixed(0)}% completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-3">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
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

      {/* Content */}
      <div className="px-4 mt-4 pb-6">
        {/* Order List Tab */}
        {activeTab === 'order' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No orders available</p>
              </div>
            ) : (
              orders.map((order: any, idx: number) => {
                const isCurrentOrder = order.orderIndex === currentIndex && !allCompleted;
                const isLocked = order.orderIndex > currentIndex;
                const isCompleted = history?.find((h: any) => h.vipOrderId === order.id);
                const price = parseFloat(order.price);
                const commissionAmt = price * (parseFloat(order.commissionRate) / 100);
                const canAfford = balance >= price;

                return (
                  <div key={order.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${isCompleted ? 'opacity-60' : ''}`}>
                    <div className="flex gap-3 p-4">
                      {/* Product Image with number badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                          {order.productImage ? (
                            <img src={order.productImage} alt={order.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingCart className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-1 -left-1 w-5 h-5 bg-gray-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate mb-1">{order.productName}</h3>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-gray-500">Order Amount: <span className="font-medium text-gray-700">${order.price}</span></span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-xs text-gray-500">Commission:</span>
                          <span className="text-xs font-bold text-green-600">${commissionAmt.toFixed(2)}</span>
                        </div>

                        {/* Action Button */}
                        <div className="mt-2 flex justify-end">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                              <Check className="w-3 h-3" /> Completed
                            </span>
                          ) : isCurrentOrder ? (
                            canAfford ? (
                              <button
                                onClick={() => handleComplete(order.id)}
                                disabled={completing === order.id}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-2 rounded-full shadow-md hover:opacity-90 transition-opacity"
                              >
                                {completing === order.id ? (
                                  <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                                ) : null}
                                Order
                              </button>
                            ) : (
                              <button disabled className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full cursor-not-allowed">
                                <Lock className="w-3 h-3" /> Insufficient
                              </button>
                            )
                          ) : isLocked ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending orders</p>
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
                        Order #{h.orderIndex + 1} &bull; {new Date(h.completedAt).toLocaleDateString()}
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
