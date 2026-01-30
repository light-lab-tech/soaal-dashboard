import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  Building2,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Loader2,
  TrendingUp,
  Activity,
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, tenants: 0, plans: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.role]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const usersRes = await api.getAllUsers();
      let tenants = 0;
      let plans = 0;
      if (user?.role === 'super_admin') {
        try {
          const tenantsRes = await api.getAllTenants();
          tenants = tenantsRes.data.tenants?.length ?? tenantsRes.data.total ?? 0;
        } catch (_) {}
        try {
          const plansRes = await api.getAdminPlans();
          plans = plansRes.data.plans?.length ?? 0;
        } catch (_) {}
      }
      setStats({
        users: usersRes.data.users?.length ?? 0,
        tenants,
        plans,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3 p-6">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-white">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: t('admin.users'),
      value: stats.users,
      path: '/admin/users',
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-500/30',
      trend: '+12%',
    },
    ...(user?.role === 'super_admin'
      ? [
          {
            icon: Building2,
            label: t('admin.allTenants'),
            value: stats.tenants,
            path: '/admin/tenants',
            color: 'from-cyan-500 to-teal-600',
            shadow: 'shadow-cyan-500/30',
            trend: '+8%',
          },
          {
            icon: CreditCard,
            label: t('admin.planManagement'),
            value: stats.plans,
            path: '/admin/plans',
            color: 'from-purple-500 to-purple-600',
            shadow: 'shadow-purple-500/30',
            trend: '',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass-card relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                {t('admin.title')}
              </span>
            </h1>
            <p className="text-sm text-slate-400">{t('admin.platformStats')}</p>
          </div>
          <button
            onClick={loadStats}
            className="glass-button-secondary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 group"
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>{t('common.update')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid grid-cols-1 gap-4 ${user?.role === 'super_admin' ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.path}
              onClick={() => navigate(stat.path)}
              className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center ${stat.shadow}`}>
                  <Icon size={20} className="text-white" />
                </div>
                {stat.trend && (
                  <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1 group-hover:text-glow transition-all">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
                <ArrowRight
                  size={20}
                  className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all rtl-flip"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-pink-400" size={20} />
          <h2 className="text-lg font-semibold text-white">
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              {t('admin.quickLinks')}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="glass-card group hover:scale-[1.02] transition-all duration-300 text-start p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-blue-500/30">
                <Users size={18} className="text-white" />
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all rtl-flip" />
            </div>
            <h3 className="text-sm font-medium text-white group-hover:text-glow transition-all">
              {t('admin.userManagement')}
            </h3>
          </button>
          {user?.role === 'super_admin' && (
            <>
              <button
                onClick={() => navigate('/admin/tenants')}
                className="glass-card group hover:scale-[1.02] transition-all duration-300 text-start p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-cyan-500/30">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all rtl-flip" />
                </div>
                <h3 className="text-sm font-medium text-white group-hover:text-glow transition-all">
                  {t('admin.tenantManagement')}
                </h3>
              </button>
              <button
                onClick={() => navigate('/admin/plans')}
                className="glass-card group hover:scale-[1.02] transition-all duration-300 text-start p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-purple-500/30">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all rtl-flip" />
                </div>
                <h3 className="text-sm font-medium text-white group-hover:text-glow transition-all">
                  {t('admin.planManagement')}
                </h3>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
