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
  Bell, Check, CheckCheck
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

// Notification Bell Component
function NotificationBell({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Admin notifications
  const adminNotifications = trpc.admin.getNotifications.useQuery(
    { limit: 20 },
    { enabled: isAdmin, refetchInterval: 30000 }
  );
  const adminUnreadCount = trpc.admin.getUnreadNotificationCount.useQuery(
    undefined,
    { enabled: isAdmin, refetchInterval: 30000 }
  );
  const adminMarkRead = trpc.admin.markNotificationAsRead.useMutation({
    onSuccess: () => {
      adminNotifications.refetch();
      adminUnreadCount.refetch();
    },
  });
  const adminMarkAllRead = trpc.admin.markAllNotificationsAsRead.useMutation({
    onSuccess: () => {
      adminNotifications.refetch();
      adminUnreadCount.refetch();
    },
  });

  // Member notifications
  const memberNotifications = trpc.member.getNotifications.useQuery(
    { limit: 20 },
    { enabled: !isAdmin, refetchInterval: 30000 }
  );
  const memberUnreadCount = trpc.member.getUnreadNotificationCount.useQuery(
    undefined,
    { enabled: !isAdmin, refetchInterval: 30000 }
  );
  const memberMarkRead = trpc.member.markNotificationAsRead.useMutation({
    onSuccess: () => {
      memberNotifications.refetch();
      memberUnreadCount.refetch();
    },
  });
  const memberMarkAllRead = trpc.member.markAllNotificationsAsRead.useMutation({
    onSuccess: () => {
      memberNotifications.refetch();
      memberUnreadCount.refetch();
    },
  });

  const notifications = isAdmin ? adminNotifications.data : memberNotifications.data;
  const unreadCount = isAdmin ? adminUnreadCount.data?.count : memberUnreadCount.data?.count;
  const markRead = isAdmin ? adminMarkRead : memberMarkRead;
  const markAllRead = isAdmin ? adminMarkAllRead : memberMarkAllRead;

  // Close dropdown on outside click
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
    if (!notification.isRead) {
      markRead.mutate({ notificationId: notification.id });
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_deposit': return '💰';
      case 'new_withdrawal': return '💸';
      case 'new_member': return '👤';
      case 'new_message': return '💬';
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

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {(unreadCount ?? 0) > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-800">
                {isAdmin ? '通知中心' : '通知'}
              </span>
              {(unreadCount ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {(unreadCount ?? 0) > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                全部已读
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">暂无通知</p>
              </div>
            ) : (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors hover:bg-blue-50/50 ${
                    !notif.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate ${!notif.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                  </div>

                  {/* Mark as read button */}
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markRead.mutate({ notificationId: notif.id });
                      }}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="标记为已读"
                    >
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

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isAdmin = user?.role === 'owner' || user?.role === 'subadmin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLang = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('worldmall_lang', code);
    setLangOpen(false);
  };

  const memberLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/orders', icon: ShoppingCart, label: t('nav.orders') },
    { to: '/deposit', icon: ArrowDownToLine, label: t('nav.deposit') },
    { to: '/withdraw', icon: ArrowUpFromLine, label: t('nav.withdraw') },
    { to: '/chat', icon: MessageCircle, label: t('nav.chat') },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

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

  const links = user?.role === 'member' ? memberLinks : adminLinks;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
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

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role} {user?.role === 'member' && `• VIP ${user?.vipLevel || 1}`}</p>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
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

          {/* Language & Logout */}
          <div className="px-3 py-4 border-t border-gray-100 space-y-1">
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="sidebar-link w-full"
              >
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

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 flex items-center justify-between">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell isAdmin={isAdmin} />

            {user?.role === 'member' && (
              <div className="text-right">
                <p className="text-xs text-gray-500">{t('dashboard.balance')}</p>
                <p className="text-sm font-semibold text-gray-900">${user?.balance || '0.00'}</p>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
