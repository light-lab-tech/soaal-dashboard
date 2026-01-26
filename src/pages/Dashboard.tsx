import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Tenant } from '../types';
import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  Users,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalDocuments: 0,
    pendingQuestions: 0,
    satisfactionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const tenantsResponse = await api.getTenants();
      setTenants(tenantsResponse.data.tenants);

      // Calculate stats from tenants
      let totalDocs = 0;
      let pendingQs = 0;
      let totalFeedback = 0;
      let positiveFeedback = 0;

      for (const tenant of tenantsResponse.data.tenants) {
        try {
          const docsResponse = await api.getDocuments(tenant.id);
          totalDocs += docsResponse.data.documents.length;

          const questionsResponse = await api.getPendingQuestions(tenant.id);
          pendingQs += questionsResponse.data.questions.filter(q => q.status === 'pending').length;

          const feedbackResponse = await api.getFeedbackStats(tenant.id);
          totalFeedback += feedbackResponse.data.total_feedback;
          positiveFeedback += feedbackResponse.data.positive_count;
        } catch (error) {
          console.error(`Error loading data for tenant ${tenant.id}:`, error);
        }
      }

      setStats({
        totalTenants: tenantsResponse.data.tenants.length,
        totalDocuments: totalDocs,
        pendingQuestions: pendingQs,
        satisfactionRate: totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Building2,
      label: t('dashboard.createTenant'),
      onClick: () => navigate('/tenants'),
      color: 'from-cyan-400 via-teal-500 to-cyan-500',
      shadow: 'shadow-cyan-500/30',
    },
    {
      icon: FileText,
      label: t('dashboard.uploadDocument'),
      onClick: () => tenants.length > 0 && navigate(`/tenants/${tenants[0].id}/documents`),
      color: 'from-purple-400 via-pink-500 to-purple-500',
      shadow: 'shadow-purple-500/30',
    },
    {
      icon: BarChart3,
      label: t('dashboard.viewAnalytics'),
      onClick: () => tenants.length > 0 && navigate(`/tenants/${tenants[0].id}/analytics`),
      color: 'from-amber-400 via-orange-500 to-amber-500',
      shadow: 'shadow-amber-500/30',
    },
  ];

  const statCards = [
    {
      icon: Building2,
      label: t('dashboard.totalTenants'),
      value: stats.totalTenants,
      color: 'from-cyan-400 via-teal-500 to-cyan-600',
      shadow: 'shadow-cyan-500/30',
      trend: '+12%',
    },
    {
      icon: FileText,
      label: t('dashboard.totalDocuments'),
      value: stats.totalDocuments,
      color: 'from-purple-400 via-pink-500 to-purple-600',
      shadow: 'shadow-purple-500/30',
      trend: '+24%',
    },
    {
      icon: MessageSquare,
      label: t('dashboard.pendingQuestions'),
      value: stats.pendingQuestions,
      color: 'from-amber-400 via-orange-500 to-amber-600',
      shadow: 'shadow-amber-500/30',
      trend: '+8%',
    },
    {
      icon: TrendingUp,
      label: t('dashboard.satisfactionRate'),
      value: `${stats.satisfactionRate}%`,
      color: 'from-emerald-400 via-green-500 to-emerald-600',
      shadow: 'shadow-emerald-500/30',
      trend: '+5%',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-white/30 border-t-white animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Welcome Section */}
      <div className="glass-card relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
        <div className="relative">
          <h1 className="text-xl font-bold mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              {t('dashboard.welcome')}, {user?.name}!
            </span>
          </h1>
          <p className="text-sm text-glass-textSecondary">
            {t('dashboard.overview')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card group hover:scale-[1.02] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center ${stat.shadow}`}>
                  <Icon size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-0.5 group-hover:text-glow transition-all">
                {stat.value}
              </h3>
              <p className="text-xs text-glass-textSecondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="text-pink-400" size={18} />
            <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
              {t('dashboard.quickActions')}
            </span>
          </h2>
          <button
            onClick={loadDashboardData}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
          >
            <RefreshCw size={16} className="text-glass-textSecondary" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                disabled={action.onClick.toString().includes('navigate') && tenants.length === 0}
                className="glass-card group hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center ${action.shadow}`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <ArrowRight size={16} className="text-glass-textSecondary group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-sm font-medium text-white group-hover:text-glow transition-all">
                  {action.label}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Tenants */}
      {tenants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Building2 className="text-cyan-400" size={18} />
              <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-400 bg-clip-text text-transparent">
                {t('nav.tenants')}
              </span>
              <span className="text-glass-textSecondary text-sm font-normal">
                ({tenants.length})
              </span>
            </h2>
            <button
              onClick={() => navigate('/tenants')}
              className="glass-button-secondary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 group"
            >
              <span>{t('dashboard.viewAll')}</span>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tenants.slice(0, 3).map((tenant, index) => (
              <div
                key={tenant.id}
                onClick={() => navigate(`/tenants/${tenant.id}`)}
                className="glass-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 shadow-cyan-500/30 flex items-center justify-center">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5 group-hover:text-glow transition-all">
                  {tenant.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="text-glass-textSecondary" />
                    <span className="text-xs text-glass-textSecondary capitalize">{tenant.plan} {t('tenants.plan')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={12} className="text-glass-textSecondary" />
                    <span className="text-xs text-glass-textSecondary">
                      {t('dashboard.created')} {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <button className="w-full glass-button-secondary py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 group">
                    <span>{t('dashboard.viewDetails')}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tenants.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400/20 via-teal-500/20 to-cyan-400/20 flex items-center justify-center">
            <Building2 size={28} className="text-cyan-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">{t('dashboard.noTenantsYet')}</h3>
          <p className="text-sm text-glass-textSecondary mb-4">
            {t('dashboard.getStartedTenant')}
          </p>
          <button
            onClick={() => navigate('/tenants')}
            className="glass-button px-5 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2 group mx-auto"
          >
            <Plus size={16} />
            <span>{t('dashboard.createTenant')}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
