import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AtSign,
  CheckCircle2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  Webhook,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Tenant, XConfigData, XIntegration } from '../types';

const initialForm: XConfigData = {
  api_key: '',
  api_secret: '',
  access_token: '',
  access_token_secret: '',
  webhook_env: '',
  register_webhook: true,
};

const X: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { tenantId } = useParams<{ tenantId: string }>();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [xIntegration, setXIntegration] = useState<XIntegration | null>(null);
  const [form, setForm] = useState<XConfigData>(initialForm);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    void loadData();
  }, [tenantId]);

  const loadData = async (refresh = false) => {
    if (!tenantId) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [tenantResult, xConfigResult] = await Promise.allSettled([
        api.getTenant(tenantId),
        api.getXConfig(tenantId),
      ]);

      if (tenantResult.status === 'fulfilled') {
        setTenant(tenantResult.value.data.tenant);
        if (tenantResult.value.data.x_integration) {
          setXIntegration(tenantResult.value.data.x_integration);
          setWebhookUrl(tenantResult.value.data.x_integration.webhook_url || '');
        }
      } else {
        throw tenantResult.reason;
      }

      if (xConfigResult.status === 'fulfilled') {
        setXIntegration(xConfigResult.value.data.x_integration);
        setWebhookUrl(xConfigResult.value.data.x_integration.webhook_url || '');
      }
    } catch (error) {
      console.error('Error loading X integration:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleChange = (field: keyof XConfigData, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;

    try {
      setIsSubmitting(true);
      const payload: XConfigData = {
        api_key: form.api_key.trim(),
        api_secret: form.api_secret.trim(),
        access_token: form.access_token.trim(),
        access_token_secret: form.access_token_secret.trim(),
        webhook_env: form.webhook_env.trim(),
        register_webhook: form.register_webhook,
      };

      const response = await api.setXConfig(tenantId, payload);

      setXIntegration({
        connected: true,
        account_user_id: response.data.account_user_id,
        account_username: response.data.account_username,
        webhook_env: payload.webhook_env,
        webhook_url: response.data.webhook_url,
      });
      setWebhookUrl(response.data.webhook_url || '');
      setForm((prev) => ({
        ...initialForm,
        register_webhook: prev.register_webhook ?? true,
      }));
      showToast(response.data.message || t('x.saved'), 'success');
    } catch (error: any) {
      console.error('Error saving X config:', error);
      showToast(error?.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!tenantId) return;
    if (!window.confirm(t('x.disconnectConfirm'))) return;

    try {
      setIsDisconnecting(true);
      await api.deleteXConfig(tenantId);
      setXIntegration({
        connected: false,
      });
      setWebhookUrl('');
      showToast(t('x.disconnected'), 'success');
    } catch (error: any) {
      console.error('Error disconnecting X:', error);
      showToast(error?.message || t('common.error'), 'error');
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-white" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white mb-0.5">
            {t('x.title')} - {tenant?.name}
          </h1>
          <p className="text-sm text-glass-textSecondary">{t('x.connectAccount')}</p>
        </div>

        <button
          type="button"
          onClick={() => void loadData(true)}
          disabled={isRefreshing}
          className="glass-button-secondary px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
        >
          {isRefreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          {t('x.refreshStatus')}
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-slate-800 to-black">
            <AtSign size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white">
              {xIntegration?.connected ? t('x.connected') : t('x.notConnected')}
            </h2>
            <p className="text-xs text-glass-textSecondary">
              {xIntegration?.account_username ? `@${xIntegration.account_username}` : t('x.statusHint')}
            </p>
          </div>
          {xIntegration?.connected && <CheckCircle2 size={18} className="text-emerald-400" />}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-glass-textSecondary mb-1">{t('x.account')}</p>
            <p className="text-sm text-white font-medium">
              {xIntegration?.account_username ? `@${xIntegration.account_username}` : t('x.notAvailable')}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-glass-textSecondary mb-1">{t('x.accountId')}</p>
            <p className="text-sm text-white font-medium">{xIntegration?.account_user_id || t('x.notAvailable')}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[11px] uppercase tracking-wide text-glass-textSecondary mb-1">{t('x.webhookEnv')}</p>
            <p className="text-sm text-white font-medium">{xIntegration?.webhook_env || t('x.notAvailable')}</p>
          </div>
        </div>

        {xIntegration?.connected && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {xIntegration.account_username && (
              <a
                href={`https://x.com/${xIntegration.account_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-button-secondary px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={15} />
                {t('x.openProfile')}
              </a>
            )}
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="glass-button-secondary px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 text-red-300"
            >
              {isDisconnecting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              {t('x.disconnect')}
            </button>
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Save size={15} />
          {t('x.credentials')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-glass-text mb-1.5">{t('x.apiKey')}</label>
              <input
                type="text"
                value={form.api_key}
                onChange={(e) => handleChange('api_key', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder={t('x.apiKeyPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-glass-text mb-1.5">{t('x.apiSecret')}</label>
              <input
                type="password"
                value={form.api_secret}
                onChange={(e) => handleChange('api_secret', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder={t('x.apiSecretPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-glass-text mb-1.5">{t('x.accessToken')}</label>
              <input
                type="text"
                value={form.access_token}
                onChange={(e) => handleChange('access_token', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder={t('x.accessTokenPlaceholder')}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-glass-text mb-1.5">{t('x.accessTokenSecret')}</label>
              <input
                type="password"
                value={form.access_token_secret}
                onChange={(e) => handleChange('access_token_secret', e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder={t('x.accessTokenSecretPlaceholder')}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-glass-text mb-1.5">{t('x.webhookEnv')}</label>
            <input
              type="text"
              value={form.webhook_env}
              onChange={(e) => handleChange('webhook_env', e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm"
              placeholder={t('x.webhookEnvPlaceholder')}
              required
            />
            <p className="text-[10px] text-glass-textSecondary mt-1.5">{t('x.webhookEnvHint')}</p>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.register_webhook}
              onChange={(e) => handleChange('register_webhook', e.target.checked)}
              className="mt-1 rounded"
            />
            <div>
              <p className="text-sm text-white font-medium">{t('x.registerWebhook')}</p>
              <p className="text-xs text-glass-textSecondary mt-1">{t('x.registerWebhookHint')}</p>
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="glass-button w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Save size={15} />
                {xIntegration?.connected ? t('x.updateConnection') : t('x.saveConnection')}
              </>
            )}
          </button>
        </form>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Webhook size={15} />
          {t('x.webhookSetup')}
        </h3>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-glass-textSecondary mb-2">{t('x.webhookUrl')}</p>
            <div className="flex items-start gap-2">
              <LinkIcon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
              <code className="text-xs text-white break-all">
                {webhookUrl || t('x.webhookUrlPending')}
              </code>
            </div>
          </div>

          <ol className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((step) => (
              <li key={step} className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white font-bold text-[11px]">
                  {step}
                </div>
                <p className="text-sm text-glass-text pt-0.5">{t(`x.step${step}` as any)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default X;
