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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/tenants')}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30">
              <Building2 size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{tenant.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {tenant.status}
                </span>
                <span className="text-slate-400 text-sm capitalize">{tenant.plan} plan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <FileText size={16} />
              {t('nav.documents')}
            </div>
            <p className="text-2xl font-bold text-white">{analytics.documents_count}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <MessageSquare size={16} />
              {t('nav.chats')}
            </div>
            <p className="text-2xl font-bold text-white">{analytics.chats_count}</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <ThumbsUp size={16} />
              {t('analytics.positive')}
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {analytics.feedback.positive} ({analytics.feedback.positive_percent.toFixed(0)}%)
            </p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <ThumbsDown size={16} />
              {t('analytics.negative')}
            </div>
            <p className="text-2xl font-bold text-red-400">
              {analytics.feedback.negative} ({analytics.feedback.negative_percent.toFixed(0)}%)
            </p>
          </div>
        </div>
      )}

      {/* Tenant Info */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-4">{t('tenants.tenantInfo')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <Calendar size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t('admin.createdAt')}</p>
              <p className="text-white">{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
            <Activity size={18} className="text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">{t('billing.status')}</p>
              <p className="text-white capitalize">{tenant.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t('common.actions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`glass-card p-5 text-left group transition-all duration-300 ${action.hoverBg} hover:scale-[1.02]`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-20`}>
                    <Icon size={24} className={action.iconColor} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold group-hover:text-cyan-300 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{action.description}</p>
                  </div>
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
