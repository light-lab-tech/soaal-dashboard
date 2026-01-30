import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Tenant, TenantAnalytics } from '../../types';
import {
  BarChart3,
  ArrowLeft,
  FileText,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Search,
  Zap,
  Loader2,
} from 'lucide-react';

const AdminTenantAnalytics: React.FC = () => {
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
      // Get tenant info
      const tenantsRes = await api.getAllTenants();
      const foundTenant = tenantsRes.data.tenants?.find(t => t.id === tenantId);
      if (foundTenant) {
        setTenant(foundTenant);
      }
      
      // Get analytics
      const analyticsRes = await api.getAdminTenantAnalytics(tenantId);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!analytics) {
    return (
      <div className="glass-card p-8 text-center">
        <BarChart3 size={48} className="mx-auto text-slate-500 mb-3" />
        <p className="text-slate-400">Analytics not available</p>
        <button
          onClick={() => navigate(`/admin/tenants/${tenantId}`)}
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
          onClick={() => navigate(`/admin/tenants/${tenantId}`)}
          className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} className="rtl-flip" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('nav.analytics')}</h1>
          <p className="text-slate-400 text-sm">{tenant?.name}</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <FileText size={20} className="text-cyan-400" />
            </div>
            <span className="text-slate-400 text-sm">{t('nav.documents')}</span>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.documents_count}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <MessageSquare size={20} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-sm">{t('nav.chats')}</span>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.chats_count}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Activity size={20} className="text-purple-400" />
            </div>
            <span className="text-slate-400 text-sm">{t('chats.messages')}</span>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.messages_count}</p>
        </div>
      </div>

      {/* Feedback Stats */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-4">{t('analytics.feedback')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-700/30">
            <p className="text-slate-400 text-sm mb-1">{t('analytics.totalFeedback')}</p>
            <p className="text-2xl font-bold text-white">{analytics.feedback.total}</p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-1">
              <ThumbsUp size={16} />
              {t('analytics.positive')}
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {analytics.feedback.positive}
              <span className="text-base font-normal ml-2">
                ({analytics.feedback.positive_percent.toFixed(1)}%)
              </span>
            </p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
              <ThumbsDown size={16} />
              {t('analytics.negative')}
            </div>
            <p className="text-2xl font-bold text-red-400">
              {analytics.feedback.negative}
              <span className="text-base font-normal ml-2">
                ({analytics.feedback.negative_percent.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Usage */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-white mb-4">30-Day Usage</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Zap size={16} />
              Tokens In
            </div>
            <p className="text-xl font-bold text-white">{analytics.usage_30d.tokens_in.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Zap size={16} />
              Tokens Out
            </div>
            <p className="text-xl font-bold text-white">{analytics.usage_30d.tokens_out.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Search size={16} />
              Searches
            </div>
            <p className="text-xl font-bold text-white">{analytics.usage_30d.searches.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Activity size={16} />
              Requests
            </div>
            <p className="text-xl font-bold text-white">{analytics.usage_30d.requests.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTenantAnalytics;
