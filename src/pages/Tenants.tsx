import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Tenant, ApiKey, CreateTenantData, CreateApiKeyData } from '../types';
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Building2,
  FileText,
  MessageSquare,
  BarChart3,
  Send,
  X,
} from 'lucide-react';

const Tenants: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newTenantData, setNewTenantData] = useState<CreateTenantData>({
    name: '',
    plan: 'free',
  });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyData>({
    type: 'secret',
    rate_limit: 100,
  });

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTenants();
      setTenants(response.data.tenants);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTenant(newTenantData);
      setShowCreateModal(false);
      setNewTenantData({ name: '', plan: 'free' });
      loadTenants();
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleViewApiKeys = async (tenant: Tenant) => {
    try {
      setSelectedTenant(tenant);
      const response = await api.getTenant(tenant.id);
      setApiKeys(response.data.api_keys);
      setShowApiKeysModal(true);
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  };

  const handleCreateApiKey = async () => {
    if (!selectedTenant) return;
    try {
      const response = await api.createApiKey(selectedTenant.id, newApiKey);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white mb-0.5">{t('tenants.title')}</h1>
          <p className="text-sm text-glass-textSecondary">Manage your tenants and API keys</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={16} />
          {t('tenants.createTenant')}
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="glass-card group transition-all duration-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600">
                  <Building2 size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{tenant.name}</h3>
                  <p className="text-[11px] text-glass-textSecondary capitalize">{tenant.plan} Plan</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {tenant.status}
              </span>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <button
                onClick={() => navigate(`/tenants/${tenant.id}/documents`)}
                className="glass-button-secondary p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-cyan-500/20 hover:border-cyan-400/30 transition-all group/btn"
                title={t('nav.documents')}
              >
                <FileText size={16} className="text-cyan-400" />
                <span className="text-[10px] text-glass-textSecondary group-hover/btn:text-white">{t('nav.documents')}</span>
              </button>
              <button
                onClick={() => navigate(`/tenants/${tenant.id}/questions`)}
                className="glass-button-secondary p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-amber-500/20 hover:border-amber-400/30 transition-all group/btn"
                title={t('nav.questions')}
              >
                <MessageSquare size={16} className="text-amber-400" />
                <span className="text-[10px] text-glass-textSecondary group-hover/btn:text-white">{t('nav.questions')}</span>
              </button>
              <button
                onClick={() => navigate(`/tenants/${tenant.id}/analytics`)}
                className="glass-button-secondary p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-purple-500/20 hover:border-purple-400/30 transition-all group/btn"
                title={t('nav.analytics')}
              >
                <BarChart3 size={16} className="text-purple-400" />
                <span className="text-[10px] text-glass-textSecondary group-hover/btn:text-white">{t('nav.analytics')}</span>
              </button>
              <button
                onClick={() => navigate(`/tenants/${tenant.id}/telegram`)}
                className="glass-button-secondary p-2 rounded-lg flex flex-col items-center gap-1 hover:bg-blue-500/20 hover:border-blue-400/30 transition-all group/btn"
                title={t('nav.telegram')}
              >
                <Send size={16} className="text-blue-400" />
                <span className="text-[10px] text-glass-textSecondary group-hover/btn:text-white">{t('nav.telegram')}</span>
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[10px] text-glass-textSecondary">
                {new Date(tenant.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleViewApiKeys(tenant)}
                className="glass-button px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1"
              >
                <Key size={12} />
                API Keys
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tenants.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Building2 size={40} className="mx-auto mb-3 text-glass-textSecondary" />
          <h3 className="text-base font-semibold text-white mb-1">No tenants yet</h3>
          <p className="text-sm text-glass-textSecondary mb-4">
            Create your first tenant to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-button px-4 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
          >
            <Plus size={16} />
            Create Tenant
          </button>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-sm p-5 rounded-xl">
            <h2 className="text-lg font-semibold text-white mb-4">{t('tenants.createTenant')}</h2>
            <form onSubmit={handleCreateTenant} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">
                  {t('tenants.tenantName')}
                </label>
                <input
                  type="text"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="My Company Support"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">
                  {t('tenants.plan')}
                </label>
                <select
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value as any })}
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                >
                  <option value="free" className="bg-slate-900">Free</option>
                  <option value="pro" className="bg-slate-900">Pro</option>
                  <option value="enterprise" className="bg-slate-900">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 glass-button-secondary px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* API Keys Modal */}
      {showApiKeysModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 rounded-xl scrollbar-glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                API Keys - {selectedTenant.name}
              </h2>
              <button
                onClick={() => setShowApiKeysModal(false)}
                className="p-1.5 rounded-lg glass-button-secondary"
              >
                <X size={16} />
              </button>
            </div>

            {/* Create New API Key */}
            <div className="glass-card p-3 mb-4">
              <h3 className="text-sm font-medium text-white mb-3">
                {t('tenants.createKey')}
              </h3>
              <div className="flex gap-2">
                <select
                  value={newApiKey.type}
                  onChange={(e) => setNewApiKey({ ...newApiKey, type: e.target.value as any })}
                  className="glass-input px-3 py-1.5 rounded-lg text-sm"
                >
                  <option value="public" className="bg-slate-900">Public</option>
                  <option value="secret" className="bg-slate-900">Secret</option>
                </select>
                <input
                  type="number"
                  value={newApiKey.rate_limit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, rate_limit: parseInt(e.target.value) || -1 })}
                  className="glass-input flex-1 px-3 py-1.5 rounded-lg text-sm"
                  placeholder="-1 for unlimited"
                />
                <button
                  onClick={handleCreateApiKey}
                  className="glass-button px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  {t('common.create')}
                </button>
              </div>
            </div>

            {/* Existing API Keys */}
            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id || apiKey.prefix} className="glass-card p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Key size={14} className="text-cyan-400" />
                      <span className="text-sm font-medium text-white">{apiKey.prefix}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        apiKey.type === 'public' ? 'bg-cyan-500/20 text-cyan-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {apiKey.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id || apiKey.prefix)}
                        className="p-1.5 rounded-lg glass-button-secondary"
                      >
                        {visibleKeys[apiKey.id || apiKey.prefix] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {apiKey.key && (
                        <button
                          onClick={() => copyToClipboard(apiKey.key!)}
                          className="p-1.5 rounded-lg glass-button-secondary"
                        >
                          <Copy size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-glass-textSecondary">
                    Rate Limit: {apiKey.rate_limit === -1 ? t('tenants.unlimited') : `${apiKey.rate_limit} ${t('tenants.requestsPerHour')}`}
                  </div>
                  {apiKey.key && visibleKeys[apiKey.id || apiKey.prefix] && (
                    <div className="mt-2 glass-input p-2 rounded-lg text-xs break-all font-mono">
                      {apiKey.key}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tenants;
