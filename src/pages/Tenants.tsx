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
  MoreVertical,
  Trash2,
  Settings,
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('tenants.title')}</h1>
          <p className="text-glass-textSecondary">Manage your tenants and API keys</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="glass-button px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          {t('tenants.createTenant')}
        </button>
      </div>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="glass-card group hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                <Building2 size={24} className="text-white" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {tenant.status}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-white mb-1">{tenant.name}</h3>
            <p className="text-sm text-glass-textSecondary capitalize mb-4">
              {tenant.plan} Plan
            </p>

            <div className="flex items-center justify-between text-xs text-glass-textSecondary mb-4">
              <span>Created {new Date(tenant.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/tenants/${tenant.id}/documents`)}
                className="flex-1 glass-button-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Settings size={16} />
                Manage
              </button>
              <button
                onClick={() => handleViewApiKeys(tenant)}
                className="glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <Key size={16} />
                API Keys
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {tenants.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Building2 size={64} className="mx-auto mb-4 text-glass-textSecondary" />
          <h3 className="text-xl font-semibold text-white mb-2">No tenants yet</h3>
          <p className="text-glass-textSecondary mb-6">
            Create your first tenant to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="glass-button px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Tenant
          </button>
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-md p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{t('tenants.createTenant')}</h2>
            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-glass-text mb-2">
                  {t('tenants.tenantName')}
                </label>
                <input
                  type="text"
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  className="glass-input w-full px-4 py-3 rounded-xl"
                  placeholder="My Company Support"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-glass-text mb-2">
                  {t('tenants.plan')}
                </label>
                <select
                  value={newTenantData.plan}
                  onChange={(e) => setNewTenantData({ ...newTenantData, plan: e.target.value as any })}
                  className="glass-input w-full px-4 py-3 rounded-xl"
                >
                  <option value="free" className="bg-slate-900">Free</option>
                  <option value="pro" className="bg-slate-900">Pro</option>
                  <option value="enterprise" className="bg-slate-900">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 glass-button-secondary px-6 py-3 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 glass-button px-6 py-3 rounded-xl"
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
          <div className="glass-strong w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-2xl scrollbar-glass">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                API Keys - {selectedTenant.name}
              </h2>
              <button
                onClick={() => setShowApiKeysModal(false)}
                className="p-2 rounded-lg glass-button-secondary"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Create New API Key */}
            <div className="glass-card p-4 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {t('tenants.createKey')}
              </h3>
              <div className="flex gap-3">
                <select
                  value={newApiKey.type}
                  onChange={(e) => setNewApiKey({ ...newApiKey, type: e.target.value as any })}
                  className="glass-input px-4 py-3 rounded-xl"
                >
                  <option value="public" className="bg-slate-900">Public</option>
                  <option value="secret" className="bg-slate-900">Secret</option>
                </select>
                <input
                  type="number"
                  value={newApiKey.rate_limit}
                  onChange={(e) => setNewApiKey({ ...newApiKey, rate_limit: parseInt(e.target.value) || -1 })}
                  className="glass-input flex-1 px-4 py-3 rounded-xl"
                  placeholder="-1 for unlimited"
                />
                <button
                  onClick={handleCreateApiKey}
                  className="glass-button px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <Plus size={20} />
                  {t('common.create')}
                </button>
              </div>
            </div>

            {/* Existing API Keys */}
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id || apiKey.prefix} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key size={18} className="text-primary-400" />
                      <span className="font-semibold text-white">{apiKey.prefix}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apiKey.type === 'public' ? 'bg-primary-500/20 text-primary-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {apiKey.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id || apiKey.prefix)}
                        className="p-2 rounded-lg glass-button-secondary"
                      >
                        {visibleKeys[apiKey.id || apiKey.prefix] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {apiKey.key && (
                        <button
                          onClick={() => copyToClipboard(apiKey.key!)}
                          className="p-2 rounded-lg glass-button-secondary"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-glass-textSecondary">
                    Rate Limit: {apiKey.rate_limit === -1 ? t('tenants.unlimited') : `${apiKey.rate_limit} ${t('tenants.requestsPerHour')}`}
                  </div>
                  {apiKey.key && visibleKeys[apiKey.id || apiKey.prefix] && (
                    <div className="mt-3 glass-input p-3 rounded-lg text-sm break-all font-mono">
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
