import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { languages } from '../i18n';
import {
  LayoutDashboard, ShoppingCart, Wallet, ArrowDownToLine,
  MessageCircle, Settings, Users, CreditCard, ArrowUpFromLine,
  UserPlus, Package, Activity, Globe, LogOut, Menu, X, ChevronDown
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

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
                <div className="absolute bottom-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mb-1 overflow-hidden">
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
          <div className="flex items-center gap-4">
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
