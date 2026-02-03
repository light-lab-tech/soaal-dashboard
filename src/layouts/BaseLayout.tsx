import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
  Globe,
  User,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface BaseLayoutProps {
  changeLanguage: (lang: string) => void;
}

/** Role-based nav: each tab is a separate page. No nested "admin" section. */
function getNavItems(t: (key: string) => string, role: string | undefined) {
  const items: { icon: typeof LayoutDashboard; label: string; path: string; id: string }[] = [];

  // Admin tabs: Overview (Analytics), Users, Tenants, Plans
  if (role === 'super_admin' || role === 'admin') {
    items.push({ icon: LayoutDashboard, label: t('admin.overview'), path: '/admin', id: 'admin-overview' });
    items.push({ icon: Users, label: t('admin.users'), path: '/admin/users', id: 'admin-users' });
    if (role === 'super_admin') {
      items.push({ icon: Building2, label: t('admin.allTenants'), path: '/admin/tenants', id: 'admin-tenants' });
      items.push({ icon: CreditCard, label: t('admin.planManagement'), path: '/admin/plans', id: 'admin-plans' });
    }
  } else {
    // Regular user tabs: Overview (Dashboard), Tenants, Billing
    items.push({ icon: LayoutDashboard, label: t('dashboard.overview'), path: '/dashboard', id: 'dashboard' });
    items.push({ icon: Building2, label: t('nav.tenants'), path: '/tenants', id: 'tenants' });
    items.push({ icon: CreditCard, label: t('nav.billing'), path: '/billing', id: 'billing' });
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
        className={`fixed inset-y-0 z-50 w-64 bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isRTL ? 'right-0' : 'left-0'
        } ${
          isSidebarOpen
            ? 'translate-x-0'
            : isRTL
              ? 'translate-x-full'
              : '-translate-x-full'
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B00E8] via-[#A855F7] to-[#7C3AED]"></div>

        <div className="flex flex-col h-full">
          <div className="px-5 py-5 border-b border-slate-700/50">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-[#8B00E8]/40 group-hover:scale-105 transition-all">
                <Logo size={20} variant="icon-only" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-[#A855F7] to-[#8B00E8] bg-clip-text text-transparent">SoaAL</h1>
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

              // Get color for each nav item
              const getNavColor = () => {
                if (item.path.includes('dashboard') || item.path.includes('admin')) return 'text-[#8B00E8]';
                if (item.path.includes('tenant')) return 'text-emerald-400';
                if (item.path.includes('billing') || item.path.includes('plan')) return 'text-amber-400';
                if (item.path.includes('user')) return 'text-pink-400';
                return 'text-violet-400';
              };

              const getActiveGradient = () => {
                if (item.path.includes('dashboard') || item.path.includes('admin')) return 'from-[#8B00E8]/20 to-[#7C3AED]/20 text-[#8B00E8] border-[#8B00E8]/30 shadow-[#8B00E8]/10';
                if (item.path.includes('tenant')) return 'from-emerald-600/20 to-green-600/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10';
                if (item.path.includes('billing') || item.path.includes('plan')) return 'from-amber-600/20 to-orange-600/20 text-amber-300 border-amber-500/30 shadow-amber-500/10';
                if (item.path.includes('user')) return 'from-pink-600/20 to-rose-600/20 text-pink-300 border-pink-500/30 shadow-pink-500/10';
                return 'from-violet-600/20 to-purple-600/20 text-violet-300 border-violet-500/30 shadow-violet-500/10';
              };

              const navColor = getNavColor();

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                    reallyActive
                      ? `bg-gradient-to-r ${getActiveGradient()}`
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={`flex-shrink-0 ${reallyActive ? 'text-white' : navColor}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {reallyActive && <ChevronRight size={14} className={`opacity-70 rtl-flip ${isRTL ? 'mr-auto' : 'ml-auto'}`} />}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-700/50 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-[#8B00E8]/20 to-transparent border border-[#8B00E8]/30">
              <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center shadow-md shadow-[#8B00E8]/30">
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

      <div className={`flex-1 min-h-screen flex flex-col ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-[#8B00E8] via-[#A855F7] to-[#7C3AED]"></div>

        <header className="sticky top-0 z-40 bg-slate-900/98 backdrop-blur-xl px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B00E8]/20 to-[#7C3AED]/20 items-center justify-center border border-[#8B00E8]/30">
                  <LayoutDashboard size={16} className="text-[#8B00E8]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{getActiveLabel()}</h2>
                  <p className="text-xs text-slate-400">{user?.role === 'super_admin' || user?.role === 'admin' ? t('admin.title') : t('nav.dashboard')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800/50 border border-slate-700/50 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700/50 transition-colors">
                <Globe size={16} className="text-[#8B00E8]" />
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

        <main className="flex-1 p-4 lg:p-6">
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
