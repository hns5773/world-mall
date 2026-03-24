import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { trpc } from '../utils/trpc';
import { languages } from '../i18n';
import {
  LayoutDashboard, ShoppingCart, Wallet, ArrowDownToLine,
  MessageCircle, Settings, Users, CreditCard, ArrowUpFromLine,
  UserPlus, Package, Activity, Globe, LogOut, Menu, X, ChevronDown,
  Bell, Check, CheckCheck, Home, TrendingUp, Clock, User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// ============================================
// Notification Bell Component (shared)
// ============================================
function NotificationBell({ isAdmin, white }: { isAdmin: boolean; white?: boolean }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const adminNotifications = trpc.admin.getNotifications.useQuery(
    { limit: 20 },
    { enabled: isAdmin, refetchInterval: 30000 }
  );
  const adminUnreadCount = trpc.admin.getUnreadNotificationCount.useQuery(
    undefined,
    { enabled: isAdmin, refetchInterval: 30000 }
  );
  const adminMarkRead = trpc.admin.markNotificationAsRead.useMutation({
    onSuccess: () => { adminNotifications.refetch(); adminUnreadCount.refetch(); },
  });
  const adminMarkAllRead = trpc.admin.markAllNotificationsAsRead.useMutation({
    onSuccess: () => { adminNotifications.refetch(); adminUnreadCount.refetch(); },
  });

  const memberNotifications = trpc.member.getNotifications.useQuery(
    { limit: 20 },
    { enabled: !isAdmin, refetchInterval: 30000 }
  );
  const memberUnreadCount = trpc.member.getUnreadNotificationCount.useQuery(
    undefined,
    { enabled: !isAdmin, refetchInterval: 30000 }
  );
  const memberMarkRead = trpc.member.markNotificationAsRead.useMutation({
    onSuccess: () => { memberNotifications.refetch(); memberUnreadCount.refetch(); },
  });
  const memberMarkAllRead = trpc.member.markAllNotificationsAsRead.useMutation({
    onSuccess: () => { memberNotifications.refetch(); memberUnreadCount.refetch(); },
  });

  const notifications = isAdmin ? adminNotifications.data : memberNotifications.data;
  const unreadCount = isAdmin ? adminUnreadCount.data?.count : memberUnreadCount.data?.count;
  const markRead = isAdmin ? adminMarkRead : memberMarkRead;
  const markAllRead = isAdmin ? adminMarkAllRead : memberMarkAllRead;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) markRead.mutate({ notificationId: notification.id });
    if (notification.actionUrl) navigate(notification.actionUrl);
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_deposit': return '💰';
      case 'new_withdrawal': return '💸';
      case 'new_member': return '👤';
      case 'new_message': return '💬';
      case 'deposit_approved': return '✅';
      case 'deposit_rejected': return '❌';
      case 'withdrawal_approved': return '✅';
      case 'withdrawal_rejected': return '❌';
      case 'chat_reply': return '💬';
      default: return '🔔';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-full transition-colors ${white ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {(unreadCount ?? 0) > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">Notifications</span>
              {(unreadCount ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            {(unreadCount ?? 0) > 0 && (
              <button onClick={() => markAllRead.mutate()} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors hover:bg-blue-50/50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                      {!notif.isRead && <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <button onClick={(e) => { e.stopPropagation(); markRead.mutate({ notificationId: notif.id }); }} className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Member Layout - City Mall Style
// ============================================
function MemberLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();

  const bottomNavItems = [
    { to: '/dashboard', icon: Home, label: t('nav.home') },
    { to: '/commission', icon: TrendingUp, label: t('nav.commission') },
    { to: '/orders', icon: ShoppingCart, label: t('nav.order'), isCenter: true },
    { to: '/history', icon: Clock, label: t('nav.history') },
    { to: '/settings', icon: User, label: t('nav.myself') },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main content - with bottom padding for nav */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-end justify-around px-2 pt-1 pb-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.to || 
              (item.to === '/dashboard' && location.pathname === '/') ||
              (item.to === '/orders' && location.pathname.startsWith('/orders'));
            
            if (item.isCenter) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex flex-col items-center -mt-5 relative"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white' 
                      : 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                  }`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-teal-600' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center py-1 px-3 min-w-[60px]"
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// ============================================
// Admin Layout - Sidebar Style (unchanged)
// ============================================
function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('worldmall_lang', code);
    setLangOpen(false);
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/admin/users', icon: Users, label: t('nav.users') },
    { to: '/admin/deposits', icon: CreditCard, label: t('nav.deposits') },
    { to: '/admin/withdrawals', icon: Wallet, label: t('nav.withdrawals') },
    { to: '/admin/chat', icon: MessageCircle, label: t('nav.chat') },
    { to: '/admin/vip-orders', icon: Package, label: t('nav.vipOrders') },
    ...(user?.role === 'owner' ? [
      { to: '/admin/subadmins', icon: UserPlus, label: t('nav.subadmins') },
    ] : []),
    { to: '/admin/activity-log', icon: Activity, label: t('nav.activityLog') },
    { to: '/admin/settings', icon: Settings, label: t('nav.globalSettings') },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">World Mall</span>
            </div>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {adminLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-3 py-4 border-t border-gray-100 space-y-1">
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="sidebar-link w-full">
                <Globe className="w-5 h-5" />
                <span className="text-sm flex-1 text-left">{t('settings.language')}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mb-1 max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLang(lang.code)}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${i18n.language === lang.code ? 'bg-primary-50 text-primary-700' : ''}`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleLogout} className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              <span className="text-sm">{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <NotificationBell isAdmin={true} />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// ============================================
// Main Layout - Routes to correct layout
// ============================================
export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore();
  const isMember = user?.role === 'member';

  if (isMember) {
    return <MemberLayout>{children}</MemberLayout>;
  }

  return <AdminLayout>{children}</AdminLayout>;
}
