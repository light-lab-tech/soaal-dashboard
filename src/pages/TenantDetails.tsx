import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Tenant, ApiKey, CreateApiKeyData } from '../types';
import {
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  Send,
  Key,
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Plus,
  X,
  Calendar,
  CreditCard,
  Activity,
} from 'lucide-react';

const TenantDetails: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyData>({
    type: 'secret',
    rate_limit: 100,
  });

  useEffect(() => {
    if (!tenantId) {
      navigate('/tenants');
      return;
    }
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const response = await api.getTenant(tenantId);
      setTenant(response.data.tenant);
      setApiKeys(response.data.api_keys || []);
    } catch (error) {
      console.error('Error loading tenant:', error);
      navigate('/tenants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    if (!tenantId) return;
    try {
      const response = await api.createApiKey(tenantId, newApiKey);
      if (response.data.api_key.key) {
        setApiKeys([...apiKeys, response.data.api_key]);
      }
      setNewApiKey({ type: 'secret', rate_limit: 100 });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const actions = [
    {
      id: 'documents',
      icon: FileText,
      label: t('nav.documents'),
      description: 'Manage knowledge base documents',
      path: `/tenants/${tenantId}/documents`,
      color: 'from-cyan-500 to-teal-600',
      iconColor: 'text-cyan-400',
      hoverBg: 'hover:bg-cyan-500/10 hover:border-cyan-400/30',
    },
    {
      id: 'questions',
      icon: MessageSquare,
      label: t('nav.questions'),
      description: 'Answer pending user questions',
      path: `/tenants/${tenantId}/questions`,
      color: 'from-amber-500 to-orange-600',
      iconColor: 'text-amber-400',
      hoverBg: 'hover:bg-amber-500/10 hover:border-amber-400/30',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: t('nav.analytics'),
      description: 'View feedback and analytics',
      path: `/tenants/${tenantId}/analytics`,
      color: 'from-purple-500 to-pink-600',
      iconColor: 'text-purple-400',
      hoverBg: 'hover:bg-purple-500/10 hover:border-purple-400/30',
    },
    {
      id: 'telegram',
      icon: Send,
      label: t('nav.telegram'),
      description: 'Configure Telegram bot',
      path: `/tenants/${tenantId}/telegram`,
      color: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-400',
      hoverBg: 'hover:bg-blue-500/10 hover:border-blue-400/30',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="glass-card p-8 text-center">
        <Building2 size={36} className="mx-auto mb-3 text-glass-textSecondary" />
        <h3 className="text-base font-semibold text-white mb-1">Tenant not found</h3>
        <p className="text-sm text-glass-textSecondary mb-4">
          The tenant you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate('/tenants')}
          className="glass-button px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Back to Tenants
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back Button & Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tenants')}
            className="p-2 rounded-lg glass-button-secondary"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white">{tenant.name}</h1>
            <p className="text-sm text-glass-textSecondary">Tenant Management</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
          tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {tenant.status}
        </span>
      </div>

      {/* Tenant Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={14} className="text-cyan-400" />
            <span className="text-xs text-glass-textSecondary">Plan</span>
          </div>
          <p className="text-sm font-semibold text-white capitalize">{tenant.plan}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-emerald-400" />
            <span className="text-xs text-glass-textSecondary">Status</span>
          </div>
          <p className="text-sm font-semibold text-white capitalize">{tenant.status}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-purple-400" />
            <span className="text-xs text-glass-textSecondary">Created</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {new Date(tenant.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={14} className="text-amber-400" />
            <span className="text-xs text-glass-textSecondary">API Keys</span>
          </div>
          <p className="text-sm font-semibold text-white">{apiKeys.length} keys</p>
        </div>
      </div>

      {/* Actions Grid */}
      <div>
        <h2 className="text-sm font-medium text-glass-textSecondary mb-3">Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.path)}
                className={`glass-card p-4 text-left transition-all duration-200 ${action.hoverBg} group`}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} w-fit mb-3`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-glow transition-all">
                  {action.label}
                </h3>
                <p className="text-xs text-glass-textSecondary">
                  {action.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Keys Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-glass-textSecondary">API Keys</h2>
          <button
            onClick={() => setShowApiKeysModal(true)}
            className="glass-button px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <Plus size={14} />
            New Key
          </button>
        </div>

        {apiKeys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id || apiKey.prefix} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium text-white">{apiKey.prefix}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      apiKey.type === 'public' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {apiKey.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id || apiKey.prefix)}
                      className="p-1.5 rounded glass-button-secondary"
                    >
                      {visibleKeys[apiKey.id || apiKey.prefix] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    {apiKey.key && (
                      <button
                        onClick={() => copyToClipboard(apiKey.key!)}
                        className="p-1.5 rounded glass-button-secondary"
                      >
                        <Copy size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-glass-textSecondary">
                  Rate: {apiKey.rate_limit === -1 ? t('tenants.unlimited') : `${apiKey.rate_limit} ${t('tenants.requestsPerHour')}`}
                </p>
                {apiKey.key && visibleKeys[apiKey.id || apiKey.prefix] && (
                  <div className="mt-2 glass-input p-2 rounded text-[11px] break-all font-mono">
                    {apiKey.key}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <Key size={28} className="mx-auto mb-2 text-glass-textSecondary" />
            <p className="text-sm text-glass-textSecondary">No API keys yet</p>
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      {showApiKeysModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-sm p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t('tenants.createKey')}</h2>
              <button
                onClick={() => setShowApiKeysModal(false)}
                className="p-1.5 rounded-lg glass-button-secondary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">Type</label>
                <select
                  value={newApiKey.type}
                  onChange={(e) => setNewApiKey({ ...newApiKey, type: e.target.value as any })}
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                >
                  <option value="public" className="bg-slate-900">Public</option>
                  <option value="secret" className="bg-slate-900">Secret</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">Rate Limit</label>
                <input
                  type="number"
                  value={newApiKey.rate_limit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, rate_limit: parseInt(e.target.value) || -1 })}
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="-1 for unlimited"
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setShowApiKeysModal(false)}
                  className="flex-1 glass-button-secondary px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    handleCreateApiKey();
                    setShowApiKeysModal(false);
                  }}
                  className="flex-1 glass-button px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDetails;
