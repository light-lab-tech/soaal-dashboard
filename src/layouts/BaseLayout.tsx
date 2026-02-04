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
import { GlassCard } from '../components/ui/GlassCard';
import { IconButton } from '../components/ui/AnimatedButton';


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
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = getNavItems(t, user?.role);

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const getNavColor = (path: string) => {
    if (path.includes('dashboard') || path.includes('admin')) return { color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' };
    if (path.includes('tenant')) return { color: 'text-emerald-400', gradient: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' };
    if (path.includes('billing') || path.includes('plan')) return { color: 'text-amber-400', gradient: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' };
    if (path.includes('user')) return { color: 'text-pink-400', gradient: 'from-pink-500/20 to-pink-600/10 border-pink-500/30' };
    return { color: 'text-purple-400', gradient: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' };
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 z-50 w-64 bg-slate-900/98 backdrop-blur-xl border-r border-slate-700/50
          transform transition-transform duration-300 ease-out lg:translate-x-0
          ${isRTL ? 'right-0 border-l border-r-0' : 'left-0'}
          ${isSidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-slate-700/50">
            <Link to={user?.role === 'super_admin' || user?.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                <Logo size={20} variant="icon-only" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Soaal
                </h1>
                <p className="text-xs text-slate-400">RAG Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin' && location.pathname.startsWith(item.path + '/'));
              const reallyActive = item.path.startsWith('/admin') ? location.pathname === item.path : isActive;
              const colors = getNavColor(item.path);

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                    ${reallyActive
                      ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon size={18} className={`flex-shrink-0 ${reallyActive ? 'text-white' : colors.color}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {reallyActive && (
                    <ChevronRight 
                      size={14} 
                      className={`opacity-70 flex-shrink-0 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} 
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-700/50 space-y-3">
            <GlassCard variant="outlined" className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                  <User size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            </GlassCard>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 text-sm font-medium group"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen flex flex-col ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

        {/* Header */}
        <header className={`
          sticky top-0 z-40 px-4 lg:px-6 py-4 transition-all duration-300
          ${isScrolled ? 'bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-black/10' : 'bg-transparent'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconButton
                variant="secondary"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
                icon={isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              />
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 items-center justify-center border border-purple-500/30">
                  <LayoutDashboard size={18} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{getActiveLabel()}</h2>
                  <p className="text-xs text-slate-400">
                    {user?.role === 'super_admin' || user?.role === 'admin' ? t('admin.title') : t('nav.dashboard')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-800/50 rounded-full p-1">
                <Globe size={14} className="ml-2 text-slate-500" />
                {['en', 'ar'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                      ${i18n.language === lang 
                        ? 'bg-purple-500 text-white' 
                        : 'text-slate-400 hover:text-white'}
                    `}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BaseLayout;
