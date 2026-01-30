import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminSuperAdminRoute from './components/AdminSuperAdminRoute';
import UserRoute from './components/UserRoute';
import NotFoundRedirect from './components/NotFoundRedirect';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import BaseLayout from './layouts/BaseLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import TenantDetails from './pages/TenantDetails';
import Documents from './pages/Documents';
import Questions from './pages/Questions';
import Analytics from './pages/Analytics';
import Telegram from './pages/Telegram';
import Chats from './pages/Chats';
import AllChats from './pages/AllChats';
import Billing from './pages/Billing';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTenants from './pages/admin/AdminTenants';
import AdminPlans from './pages/admin/AdminPlans';

function App() {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <AuthProvider>
      {/* Background Orbs - Fixed position container */}
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      <div className="min-h-screen relative">

        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<BaseLayout changeLanguage={changeLanguage} />}>
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* User-only routes */}
              <Route element={<UserRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/chats" element={<AllChats />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/tenants/:tenantId" element={<TenantDetails />} />
                <Route path="/tenants/:tenantId/documents" element={<Documents />} />
                <Route path="/tenants/:tenantId/questions" element={<Questions />} />
                <Route path="/tenants/:tenantId/analytics" element={<Analytics />} />
                <Route path="/tenants/:tenantId/telegram" element={<Telegram />} />
                <Route path="/tenants/:tenantId/chats" element={<Chats />} />
              </Route>
              
              {/* Admin-only routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminAnalytics />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route element={<AdminSuperAdminRoute />}>
                  <Route path="/admin/tenants" element={<AdminTenants />} />
                  <Route path="/admin/plans" element={<AdminPlans />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
