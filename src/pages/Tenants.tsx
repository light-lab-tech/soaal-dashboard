import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Tenant, ApiKey, CreateTenantData, CreateApiKeyData, Plan } from '../types';
import {
  Plus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Search,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton, IconButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

const Tenants: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newTenantData, setNewTenantData] = useState<CreateTenantData>({
    name: '',
  });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyData>({
    type: 'secret',
    rate_limit: 100,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Super admin manages tenants under Admin; redirect to Admin > Tenants
  useEffect(() => {
    if (user?.role === 'super_admin') {
      navigate('/admin/tenants', { replace: true });
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    if (user?.role === 'super_admin') return;
    loadTenants();
    loadSubscription();
  }, [user?.role]);

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

  const loadSubscription = async () => {
    try {
      const response = await api.getSubscription();
      setCurrentPlan(response.data.plan || null);
      setHasActiveSubscription(!!response.data.subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const openCreateModal = () => {
    // Check if user has reached tenant limit
    if (currentPlan && currentPlan.max_projects !== undefined && currentPlan.max_projects !== -1) {
      if (tenants.length >= currentPlan.max_projects) {
        showToast(
          t('billing.tenantLimitReached', 'You have reached your plan limit of {{max}} projects/tenants. Upgrade your plan to create more.', { max: currentPlan.max_projects }),
          'error'
        );
        return;
      }
    }
    setShowCreateModal(true);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user has an active subscription or plan
    if (!hasActiveSubscription && !currentPlan) {
      setShowCreateModal(false);
      showToast(t('billing.needSubscription', 'You need an active subscription to create a tenant. Please subscribe to a plan first.'), 'error');
      navigate('/billing');
      return;
    }

    try {
      const response = await api.createTenant(newTenantData);
      setShowCreateModal(false);
      setNewTenantData({ name: '' });

      if (response.data.api_keys) {
        const allKeys = [
          response.data.api_keys.public_key,
          response.data.api_keys.secret_key,
        ].filter(Boolean);
        setApiKeys(allKeys);
        setSelectedTenant(response.data.tenant);
        setShowApiKeysModal(true);
        allKeys.forEach((key) => {
          if (key.id) {
            setVisibleKeys((prev) => ({ ...prev, [key.id!]: true }));
          }
        });
      }

      loadTenants();
    } catch (error: any) {
      const errorMessage = error?.message || t('tenants.createError', 'Failed to create tenant');
      showToast(errorMessage, 'error');
    }
  };

  const handleViewApiKeys = async (tenant: Tenant) => {
    try {
      setSelectedTenant(tenant);
      const response = await api.listApiKeys(tenant.id);
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
      if (response.data.api_key) {
        setApiKeys([...apiKeys, response.data.api_key]);
        if (response.data.api_key.key && response.data.api_key.id) {
          setVisibleKeys((prev) => ({ ...prev, [response.data.api_key.id!]: true }));
        }
      }
      setNewApiKey({ type: 'secret', rate_limit: 100 });
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const copyToClipboard = async (key: string, keyId: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = async (keyId: string) => {
    if (!keyId) return;
    
    if (visibleKeys[keyId]) {
      setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
      return;
    }

    if (!selectedTenant) return;
    try {
      const response = await api.getApiKey(selectedTenant.id, keyId);
      if (response.data.api_key.key) {
        setApiKeys((prev) =>
          prev.map((key) =>
            (key.id || key.prefix) === keyId
              ? { ...key, key: response.data.api_key.key }
              : key
          )
        );
        setVisibleKeys((prev) => ({ ...prev, [keyId]: true }));
      }
    } catch (error: any) {
      console.error('Error retrieving API key:', error);
      const errorMessage = error.response?.data?.error || 'Failed to retrieve API key';
      alert(errorMessage);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-page-enter">
        <div className="h-8 w-48 bg-slate-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('tenants.title')}</h1>
          <p className="text-slate-400">{t('tenants.description')}</p>
        </div>
        <AnimatedButton
          variant="gradient"
          onClick={openCreateModal}
          icon={<Plus size={18} />}
        >
          {t('tenants.createTenant')}
        </AnimatedButton>
      </div>

      {/* Search */}
      {tenants.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tenants.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                     text-white placeholder-slate-500
                     focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                     outline-none transition-all duration-300"
          />
        </div>
      )}

      {/* Tenants Grid */}
      {filteredTenants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {filteredTenants.map((tenant, index) => (
            <GlassCard
              key={tenant.id}
              variant="interactive"
              hover="lift"
              onClick={() => navigate(`/tenants/${tenant.id}`)}
              className="group cursor-pointer"
              animate
            >
              <div className="p-5" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {tenant.name}
                      </h3>
                    </div>
                  </div>
                  <Badge 
                    variant={tenant.status === 'active' ? 'success' : tenant.status === 'suspended' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {tenant.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  {t('dashboard.created')} {new Date(tenant.created_at).toLocaleDateString()}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <button
                    onClick={() => handleViewApiKeys(tenant)}
                    className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-white text-xs font-medium 
                             flex items-center gap-1.5 hover:bg-slate-700/70 transition-colors
                             border border-slate-600/50"
                  >
                    <Key size={12} />
                    {t('tenants.apiKeys')}
                  </button>
                  <div className="flex items-center gap-1 text-sm text-slate-400 group-hover:text-white transition-colors">
                    <span>{t('tenants.viewDetails')}</span>
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 rtl-flip" />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={searchQuery ? t('tenants.noSearchResults') : t('tenants.noTenantsYet')}
          description={searchQuery ? 'Try adjusting your search' : t('tenants.createFirstTenant')}
          action={!searchQuery ? {
            label: t('tenants.createTenant'),
            onClick: openCreateModal,
            icon: <Plus size={18} />,
          } : undefined}
          color="purple"
        />
      )}

      {/* Create Tenant Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('tenants.createTenant')}
        size="sm"
        footer={(close) => (
          <>
            <AnimatedButton
              variant="ghost"
              onClick={close}
              fullWidth
            >
              {t('common.cancel')}
            </AnimatedButton>
            <AnimatedButton
              type="button"
              variant="gradient"
              fullWidth
              isDisabled={!hasActiveSubscription && !currentPlan}
              onClick={() => {
                const form = document.querySelector('#create-tenant-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
            >
              {t('common.create')}
            </AnimatedButton>
          </>
        )}
      >
        <form id="create-tenant-form" onSubmit={handleCreateTenant} className="space-y-4">
          {/* Plan/Limit Warning */}
          {!hasActiveSubscription && !currentPlan && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-200 font-medium">{t('billing.noActivePlan', 'No Active Plan')}</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  {t('billing.noActivePlanDesc', 'You need an active subscription to create tenants.')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    navigate('/billing');
                  }}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                >
                  <CreditCard size={12} />
                  {t('billing.viewPlans', 'View Plans')}
                </button>
              </div>
            </div>
          )}

          {/* Tenant Usage Info */}
          {currentPlan && currentPlan.max_projects !== undefined && currentPlan.max_projects !== -1 && (
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t('billing.projectsUsage', 'Projects Usage')}</span>
                <span className="text-white font-medium">
                  {tenants.length} / {currentPlan.max_projects}
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    tenants.length >= currentPlan.max_projects
                      ? 'bg-red-500'
                      : tenants.length >= currentPlan.max_projects * 0.8
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min((tenants.length / currentPlan.max_projects) * 100, 100)}%` }}
                />
              </div>
              {tenants.length >= currentPlan.max_projects && (
                <p className="text-xs text-red-400 mt-2">
                  {t('billing.tenantLimitReached', 'You have reached your plan limit. Upgrade to create more.')}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('tenants.tenantName')}
            </label>
            <input
              type="text"
              value={newTenantData.name}
              onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                       text-white placeholder-slate-500
                       focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                       outline-none transition-all duration-300"
              placeholder="..."
              required
              disabled={!hasActiveSubscription && !currentPlan}
            />
          </div>
        </form>
      </Modal>

      {/* API Keys Modal */}
      <Modal
        isOpen={showApiKeysModal}
        onClose={() => setShowApiKeysModal(false)}
        title={`${t('tenants.apiKeys')} - ${selectedTenant?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Create New API Key */}
          <GlassCard variant="outlined" className="p-4">
            <h3 className="text-sm font-medium text-white mb-3">
              {t('tenants.createKey')}
            </h3>
            <div className="flex gap-2">
              <select
                value={newApiKey.type}
                onChange={(e) => setNewApiKey({ ...newApiKey, type: e.target.value as any })}
                className="px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 
                         text-white text-sm
                         focus:border-purple-500/50 outline-none"
              >
                <option value="public" className="bg-slate-900">{t('tenants.public')}</option>
                <option value="secret" className="bg-slate-900">{t('tenants.secret')}</option>
              </select>
              <input
                type="number"
                value={newApiKey.rate_limit}
                onChange={(e) => setNewApiKey({ ...newApiKey, rate_limit: parseInt(e.target.value) || -1 })}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 
                         text-white text-sm
                         focus:border-purple-500/50 outline-none"
                placeholder={t('tenants.unlimited')}
              />
              <AnimatedButton
                onClick={handleCreateApiKey}
                variant="gradient"
                size="sm"
                icon={<Plus size={14} />}
              >
                {t('common.create')}
              </AnimatedButton>
            </div>
          </GlassCard>

          {/* Existing API Keys */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
            {apiKeys.map((apiKey) => (
              <GlassCard key={apiKey.id || apiKey.prefix} variant="outlined" className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-purple-400" />
                    <span className="font-medium text-white">{apiKey.prefix}</span>
                    <Badge 
                      variant={apiKey.type === 'public' ? 'info' : 'primary'}
                      size="sm"
                    >
                      {apiKey.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(apiKey.id || apiKey.prefix)}
                      icon={visibleKeys[apiKey.id || apiKey.prefix] ? <EyeOff size={14} /> : <Eye size={14} />}
                    />
                    {apiKey.key && (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key!, apiKey.id || apiKey.prefix)}
                        icon={copiedKey === (apiKey.id || apiKey.prefix) ? 
                          <span className="text-emerald-400 text-xs">{t('common.copied')}</span> : 
                          <Copy size={14} />
                        }
                      />
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Rate Limit: {apiKey.rate_limit === -1 ? t('tenants.unlimited') : `${apiKey.rate_limit} ${t('tenants.requestsPerHour')}`}
                </p>
                {apiKey.key && visibleKeys[apiKey.id || apiKey.prefix] && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 font-mono text-xs break-all text-slate-300">
                    {apiKey.key}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tenants;
