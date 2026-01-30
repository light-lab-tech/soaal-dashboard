import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Tenant, TenantAnalytics } from '../../types';
import {
  Building2,
  ArrowLeft,
  MessageSquare,
  BarChart3,
  FileText,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Calendar,
} from 'lucide-react';

const AdminTenantDetails: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [analytics, setAnalytics] = useState<TenantAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (!tenantId) {
      navigate('/admin/tenants', { replace: true });
      return;
    }
    loadData();
  }, [tenantId, user?.role, navigate]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      // Get tenant from the admin tenants list
      const tenantsRes = await api.getAllTenants();
      const foundTenant = tenantsRes.data.tenants?.find(t => t.id === tenantId);
      if (foundTenant) {
        setTenant(foundTenant);
      }
      
      // Get analytics
      try {
        const analyticsRes = await api.getAdminTenantAnalytics(tenantId);
        setAnalytics(analyticsRes.data);
      } catch {
        console.log('Analytics not available');
      }
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    {
      id: 'chats',
      icon: MessageSquare,
      label: t('nav.chats'),
      description: t('tenants.chatsDesc'),
      path: `/admin/tenants/${tenantId}/chats`,
      color: 'from-emerald-500 to-green-600',
      iconColor: 'text-emerald-400',
      hoverBg: 'hover:bg-emerald-500/10 hover:border-emerald-400/30',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: t('nav.analytics'),
      description: t('tenants.analyticsDesc'),
      path: `/admin/tenants/${tenantId}/analytics`,
      color: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-400',
      hoverBg: 'hover:bg-purple-500/10 hover:border-purple-400/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="glass-card p-8 text-center">
        <Building2 size={48} className="mx-auto text-slate-500 mb-3" />
        <p className="text-slate-400">Tenant not found</p>
        <button
          onClick={() => navigate('/admin/tenants')}
          className="mt-4 glass-button px-4 py-2 rounded-lg text-sm"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/tenants')}
          className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <Building2 size={28} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' :
                  tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400 shadow-amber-500/20' :
                  'bg-red-500/20 text-red-400 shadow-red-500/20'
                } shadow-lg`}>
                  {tenant.status}
                </span>
                <span className="text-slate-400 text-sm capitalize flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {tenant.plan} plan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 hover:border-cyan-500/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <FileText size={16} className="text-cyan-400" />
              </div>
              {t('nav.documents')}
            </div>
            <p className="text-3xl font-bold text-white group-hover:text-glow transition-all">{analytics.documents_count}</p>
          </div>
          <div className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 hover:border-emerald-500/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <MessageSquare size={16} className="text-emerald-400" />
              </div>
              {t('nav.chats')}
            </div>
            <p className="text-3xl font-bold text-white group-hover:text-glow-emerald transition-all">{analytics.chats_count}</p>
          </div>
          <div className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 hover:border-emerald-500/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ThumbsUp size={16} className="text-emerald-400" />
              </div>
              {t('analytics.positive')}
            </div>
            <p className="text-3xl font-bold text-emerald-400">
              {analytics.feedback.positive}
              <span className="text-lg font-normal text-emerald-400/70 ml-2">({analytics.feedback.positive_percent.toFixed(0)}%)</span>
            </p>
          </div>
          <div className="glass-card p-5 group hover:scale-[1.02] transition-all duration-300 hover:border-red-500/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ThumbsDown size={16} className="text-red-400" />
              </div>
              {t('analytics.negative')}
            </div>
            <p className="text-3xl font-bold text-red-400">
              {analytics.feedback.negative}
              <span className="text-lg font-normal text-red-400/70 ml-2">({analytics.feedback.negative_percent.toFixed(0)}%)</span>
            </p>
          </div>
        </div>
      )}

      {/* Tenant Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-purple-400" />
          {t('tenants.tenantInfo')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <Calendar size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t('admin.createdAt')}</p>
              <p className="text-white font-medium">{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-slate-500/50 transition-colors">
            <div className="p-3 rounded-xl bg-cyan-500/10">
              <Activity size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t('billing.status')}</p>
              <p className="text-white font-medium capitalize">{tenant.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-pink-400" />
          {t('common.actions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`glass-card p-6 text-start group transition-all duration-300 ${action.hoverBg} hover:scale-[1.02] card-hover-lift`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-lg font-semibold group-hover:text-cyan-300 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{action.description}</p>
                  </div>
                  <ArrowLeft size={20} className="text-slate-500 group-hover:text-cyan-400 rotate-180 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminTenantDetails;
