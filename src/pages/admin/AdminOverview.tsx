import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, Building2, CreditCard, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

const AdminOverview: React.FC = () => {
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

  const cards = [
    { icon: Users, label: t('admin.users'), value: stats.users, path: '/admin/users', color: 'from-blue-500 to-blue-600' },
    ...(user?.role === 'super_admin'
      ? [
          { icon: Building2, label: t('admin.allTenants'), value: stats.tenants, path: '/admin/tenants', color: 'from-cyan-500 to-teal-600' },
          { icon: CreditCard, label: t('admin.planManagement'), value: stats.plans, path: '/admin/plans', color: 'from-purple-500 to-purple-600' },
        ]
      : []),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.overview')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('admin.platformStats')}</p>
        </div>
        <button onClick={loadStats} className="btn-secondary px-4 py-2 rounded-lg flex items-center gap-2">
          <RefreshCw size={16} />
          {t('common.update')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.path}
              onClick={() => navigate(card.path)}
              className="card p-6 cursor-pointer hover:scale-[1.02] transition-all group border-slate-700/50 hover:border-slate-600/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon size={22} className="text-white" />
                </div>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-sm text-slate-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">{t('admin.quickLinks')}</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/admin/users')} className="btn-primary px-4 py-2 rounded-lg text-sm">
            {t('admin.userManagement')}
          </button>
          {user?.role === 'super_admin' && (
            <>
              <button onClick={() => navigate('/admin/tenants')} className="btn-primary px-4 py-2 rounded-lg text-sm">
                {t('admin.tenantManagement')}
              </button>
              <button onClick={() => navigate('/admin/plans')} className="btn-primary px-4 py-2 rounded-lg text-sm">
                {t('admin.planManagement')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
