import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Shield,
  LogOut,
  Menu,
  X,
  Globe,
  User,
  ChevronRight,
  Home,
  Users,
} from 'lucide-react';

interface BaseLayoutProps {
  changeLanguage: (lang: string) => void;
}

/** Role-based nav: each tab is a separate page. No nested "admin" section. */
function getNavItems(t: (key: string) => string, role: string | undefined) {
  const items: { icon: typeof LayoutDashboard; label: string; path: string; id: string }[] = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/dashboard', id: 'dashboard' },
  ];
  
  // Regular user tabs: Tenants and Billing
  if (role !== 'super_admin' && role !== 'admin') {
    items.push({ icon: Building2, label: t('nav.tenants'), path: '/tenants', id: 'tenants' });
    items.push({ icon: CreditCard, label: t('nav.billing'), path: '/billing', id: 'billing' });
  }

  // Admin tabs: separate tabs per page (Overview, Users, Tenants, Plans)
  if (role === 'super_admin' || role === 'admin') {
    items.push({ icon: Shield, label: t('admin.overview'), path: '/admin', id: 'admin-overview' });
    items.push({ icon: Users, label: t('admin.users'), path: '/admin/users', id: 'admin-users' });
    if (role === 'super_admin') {
      items.push({ icon: Building2, label: t('admin.allTenants'), path: '/admin/tenants', id: 'admin-tenants' });
      items.push({ icon: CreditCard, label: t('admin.planManagement'), path: '/admin/plans', id: 'admin-plans' });
    }
  }

  return items;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = getNavItems(t, user?.role);

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  const isRTL = i18n.language === 'ar';

  const getActiveLabel = () => {
    const exact = navItems.find((item) => location.pathname === item.path);
    if (exact) return exact.label;
    const starts = navItems.find((item) => item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
    if (starts) return starts.label;
    if (location.pathname.startsWith('/admin')) {
      const adminItem = navItems.find((item) => item.path !== '/admin' && location.pathname.startsWith(item.path));
      return adminItem?.label ?? t('admin.title');
    }
    return t('nav.dashboard');
  };

  return (
    <div className="min-h-screen flex">
      <aside
        className={`fixed inset-y-0 z-50 w-64 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isRTL ? 'right-0' : 'left-0'
        } ${
          isSidebarOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-slate-700/50">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/30 transition-all">
                <Home size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">SoaAL</h1>
                <p className="text-xs text-slate-400">RAG Dashboard</p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-modern">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
              const reallyActive = item.path.startsWith('/admin') ? location.pathname === item.path : isActive;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    reallyActive
                      ? 'bg-gradient-to-r from-cyan-600/20 to-teal-600/20 text-cyan-300 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {reallyActive && <ChevronRight size={14} className={`opacity-70 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-700/30 border border-slate-700/50">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <User size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      <div className={`flex-1 min-h-screen ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        <header className="sticky top-0 z-40 bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-xl font-bold text-white truncate">{getActiveLabel()}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-700/50 border border-slate-600/50 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/70 transition-colors">
                <Globe size={16} className="text-slate-400" />
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-800 text-white">English</option>
                  <option value="ar" className="bg-slate-800 text-white">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BaseLayout;
