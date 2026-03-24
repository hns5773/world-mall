import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Member pages
import MemberDashboard from './pages/member/Dashboard';
import MemberOrders from './pages/member/Orders';
import MemberDeposit from './pages/member/Deposit';
import MemberWithdraw from './pages/member/Withdraw';
import MemberChat from './pages/member/Chat';
import MemberSettings from './pages/member/Settings';
import MemberCommission from './pages/member/Commission';
import MemberHistory from './pages/member/History';
import MemberAbout from './pages/member/About';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsersPage from './pages/admin/UsersPage';
import AdminDepositsPage from './pages/admin/DepositsPage';
import AdminWithdrawalsPage from './pages/admin/WithdrawalsPage';
import AdminChatPage from './pages/admin/ChatPage';
import AdminVipOrdersPage from './pages/admin/VipOrdersPage';
import AdminSubAdminsPage from './pages/admin/SubAdminsPage';
import AdminActivityLogPage from './pages/admin/ActivityLogPage';
import AdminSettingsPage from './pages/admin/SettingsPage';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'member' ? '/dashboard' : '/admin/dashboard'} replace />;
  }

  return <Layout>{children}</Layout>;
}

// PublicRoute: allows access even if admin is logged in when visiting /register or /login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (isAuthenticated && user) {
    if (user.role === 'member') {
      return <Navigate to="/dashboard" replace />;
    }
    // For admin/subadmin, always show the public page (register/login)
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/admin/login" element={<PublicRoute><Login isAdmin /></PublicRoute>} />

        {/* Member routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['member']}><MemberDashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute allowedRoles={['member']}><MemberOrders /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute allowedRoles={['member']}><MemberDeposit /></ProtectedRoute>} />
        <Route path="/withdraw" element={<ProtectedRoute allowedRoles={['member']}><MemberWithdraw /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute allowedRoles={['member']}><MemberChat /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['member']}><MemberSettings /></ProtectedRoute>} />
        <Route path="/commission" element={<ProtectedRoute allowedRoles={['member']}><MemberCommission /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute allowedRoles={['member']}><MemberHistory /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute allowedRoles={['member']}><MemberAbout /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/deposits" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminDepositsPage /></ProtectedRoute>} />
        <Route path="/admin/withdrawals" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminWithdrawalsPage /></ProtectedRoute>} />
        <Route path="/admin/chat" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminChatPage /></ProtectedRoute>} />
        <Route path="/admin/vip-orders" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminVipOrdersPage /></ProtectedRoute>} />
        <Route path="/admin/subadmins" element={<ProtectedRoute allowedRoles={['owner']}><AdminSubAdminsPage /></ProtectedRoute>} />
        <Route path="/admin/activity-log" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminActivityLogPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['owner', 'subadmin']}><AdminSettingsPage /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
