import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useAuthStore } from '../../stores/authStore';
import { Bell, Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine, ShoppingCart, MessageCircle, TrendingUp, Users } from 'lucide-react';

// NotificationBell inline for the header
function HeaderNotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const memberNotifications = trpc.member.getNotifications.useQuery({ limit: 10 }, { refetchInterval: 30000 });
  const memberUnreadCount = trpc.member.getUnreadNotificationCount.useQuery(undefined, { refetchInterval: 30000 });
  const markRead = trpc.member.markNotificationAsRead.useMutation({
    onSuccess: () => { memberNotifications.refetch(); memberUnreadCount.refetch(); },
  });

  const unreadCount = memberUnreadCount.data?.count ?? 0;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative p-1 text-white/90 hover:text-white">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-0.5 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-800">Notifications</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {(!memberNotifications.data || memberNotifications.data.length === 0) ? (
                <div className="py-8 text-center text-sm text-gray-400">No notifications</div>
              ) : (
                memberNotifications.data.slice(0, 10).map((n: any) => (
                  <div key={n.id} onClick={() => { if (!n.isRead) markRead.mutate({ notificationId: n.id }); if (n.actionUrl) navigate(n.actionUrl); setOpen(false); }}
                    className={`px-4 py-2.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}>
                    <p className={`text-xs ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MemberDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data, isLoading } = trpc.member.getDashboard.useQuery(undefined, { refetchInterval: 30000 });
  const { data: ordersData } = trpc.member.getOrders.useQuery(undefined, { refetchInterval: 30000 });
  const { data: deposits } = trpc.member.getDeposits.useQuery(undefined, { refetchInterval: 30000 });
  const { data: withdrawals } = trpc.member.getWithdrawals.useQuery(undefined, { refetchInterval: 30000 });
  const [showBalance, setShowBalance] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  const balance = data?.balance || '0.00';
  const vipLevel = data?.vipLevel || 1;
  const currentOrderIndex = data?.currentOrderIndex || 0;
  const totalOrders = data?.totalOrders || 0;
  const completedOrders = data?.completedOrders || 0;

  // VIP progress calculation
  const vipRequirements: Record<number, number> = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 60, 7: 70, 8: 80 };
  const nextVipLevel = vipLevel < 8 ? vipLevel + 1 : 8;
  const ordersNeeded = vipRequirements[vipLevel] || 10;
  const progressPercent = Math.min((completedOrders / ordersNeeded) * 100, 100);

  // Combine deposits and withdrawals for activity feed
  const activities: any[] = [];
  if (deposits) {
    deposits.forEach((d: any) => {
      activities.push({ type: 'deposit', user: user?.username, amount: d.amount, status: d.status, date: d.createdAt });
    });
  }
  if (withdrawals) {
    withdrawals.forEach((w: any) => {
      activities.push({ type: 'withdraw', user: user?.username, amount: w.amount, status: w.status, date: w.createdAt });
    });
  }
  activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  // Get product images from orders for Products section
  const productList = ordersData?.orders?.slice(0, 8) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Purple Gradient Header with Logo Watermark */}
      <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-5 pt-12 pb-8 relative overflow-hidden">
        {/* Logo watermark background */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: 'url(/logo.jpg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '80px 80px',
          }}
        />
        {/* Background decoration circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        {/* Top row: Logo + Welcome + Bell + VIP */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <img src="/logo.jpg" alt="World Mall" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <p className="text-white/70 text-xs">{t('dashboard.welcome')}</p>
              <p className="text-white font-bold text-lg">{user?.username || 'User'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <HeaderNotificationBell />
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              VIP{vipLevel}
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-white/70 text-sm">{t('home.totalBalance')}</p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white/60 hover:text-white/90">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-white text-4xl font-bold tracking-tight">
            {showBalance ? `$${balance}` : '****'}
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="grid grid-cols-4 gap-4">
            <button onClick={() => navigate('/deposit')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('home.deposit')}</span>
            </button>
            <button onClick={() => navigate('/withdraw')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('home.withdraw')}</span>
            </button>
            <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('nav.order')}</span>
            </button>
            <button onClick={() => navigate('/chat')} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600 font-medium">{t('chat.title')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Section (LIVE with real data) */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
            <h2 className="text-base font-bold text-gray-900">Products</h2>
          </div>
          <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
            LIVE
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </button>
        </div>
        
        {/* Horizontal scroll product cards */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {productList.length > 0 ? productList.map((order: any, idx: number) => (
            <div key={idx} className="flex-shrink-0 w-32 cursor-pointer" onClick={() => navigate('/orders')}>
              <div className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 shadow-sm">
                <img 
                  src={order.productImage} 
                  alt={order.productName}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-white text-xs font-bold">${order.price}</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 truncate">{order.productName}</p>
            </div>
          )) : (
            <div className="text-sm text-gray-400 py-4">No products available</div>
          )}
        </div>
      </div>

      {/* Deposit and Withdraw Activity Feed (LIVE with real data) */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
            <h2 className="text-base font-bold text-gray-900">{t('home.depositAndWithdraw')}</h2>
          </div>
          <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
            LIVE
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">No recent activity</div>
          ) : (
            activities.slice(0, 5).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.type === 'deposit' ? 'bg-green-50' : 'bg-orange-50'}`}>
                    {act.type === 'deposit' 
                      ? <ArrowDownToLine className="w-4 h-4 text-green-600" />
                      : <ArrowUpFromLine className="w-4 h-4 text-orange-600" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {act.user ? `${act.user.substring(0, 3)}***${act.user.slice(-1)}` : 'User'}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize">{act.type === 'deposit' ? t('home.deposit') : t('home.withdraw')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${act.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                    {act.type === 'deposit' ? '+' : '-'}${act.amount}
                  </p>
                  <p className="text-[10px] text-gray-400">{formatTimeAgo(act.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* VIP Progress Section */}
      <div className="px-4 mt-5">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-gray-900">VIP Progress</h3>
            </div>
            <span className="text-xs text-gray-500">
              VIP {vipLevel} → VIP {nextVipLevel}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{completedOrders}/{ordersNeeded} orders completed</span>
            <span className="text-purple-600 font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Recently Active Section (LIVE - placeholder for real data) */}
      <div className="px-4 mt-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-800 rounded-full" />
            <h2 className="text-base font-bold text-gray-900">Recently Active</h2>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full">
            <Users className="w-3 h-3" />
            LIVE
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-400">No recent activity from other members</div>
          ) : (
            activities.slice(0, 6).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${act.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'}`}>
                    {act.type === 'deposit' 
                      ? <ArrowDownToLine className="w-3.5 h-3.5 text-green-500" />
                      : <ArrowUpFromLine className="w-3.5 h-3.5 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{act.user ? `${act.user.substring(0, 3)}***${act.user.slice(-1)}` : 'User'}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{act.type === 'deposit' ? 'Deposit' : 'Withdraw'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${act.type === 'deposit' ? 'text-green-600' : 'text-red-500'}`}>
                    {act.type === 'deposit' ? '+' : '-'}${act.amount}
                  </p>
                  <p className="text-[10px] text-gray-400">{formatTimeAgo(act.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
