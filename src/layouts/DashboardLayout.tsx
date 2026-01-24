import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Shield,
  LogOut,
  Menu,
  X,
  Globe,
  User,
  ChevronRight,
  Home,
} from 'lucide-react';

interface DashboardLayoutProps {
  changeLanguage: (lang: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ changeLanguage }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Set document direction based on language
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: t('nav.dashboard'), 
      path: '/dashboard',
      id: 'dashboard'
    },
    { 
      icon: Building2, 
      label: t('nav.tenants'), 
      path: '/tenants',
      id: 'tenants'
    },
    ...(user?.role === 'super_admin' ? [{ 
      icon: Shield, 
      label: t('nav.admin'), 
      path: '/admin',
      id: 'admin'
    }] : []),
  ];

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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 z-50 w-56 glass-strong transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
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
          {/* Logo */}
          <div className="px-4 py-4 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Home size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">SoaAL</h1>
                <p className="text-[10px] text-glass-textSecondary">RAG Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-glass">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'text-glass-text hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && <ChevronRight size={14} className={`opacity-70 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-white/10 space-y-1.5">
            <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-glass-textSecondary truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 transition-all duration-200 text-sm font-medium"
            >
              <LogOut size={16} />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 min-h-screen ${isRTL ? 'lg:mr-56' : 'lg:ml-56'}`}>
        {/* Header */}
        <header className="glass-strong sticky top-0 z-40 px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-lg font-semibold text-white truncate">
                {navItems.find((item) => location.pathname === item.path || location.pathname.startsWith(item.path))?.label || t('nav.dashboard')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Globe size={14} className="text-glass-textSecondary" />
                <select
                  value={i18n.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-white text-xs font-medium outline-none cursor-pointer"
                >
                  <option value="en" className="bg-slate-900 text-white">English</option>
                  <option value="ar" className="bg-slate-900 text-white">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
