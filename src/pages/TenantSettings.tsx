import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Tenant, TenantSettings as TenantSettingsType } from '../types';
import {
  Settings,
  ArrowLeft,
  Save,
  Loader2,
} from 'lucide-react';

const TenantSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettingsType>({
    answer_style: null,
    message_limit_per_chat: null,
    settings: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!tenantId) {
      navigate('/tenants');
      return;
    }
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const [tenantResponse, settingsResponse] = await Promise.all([
        api.getTenant(tenantId),
        api.getTenantSettings(tenantId),
      ]);
      setTenant(tenantResponse.data.tenant);
      setSettings(settingsResponse.data);
    } catch (error) {
      console.error('Error loading tenant settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tenantId) return;
    try {
      setIsSaving(true);
      await api.updateTenantSettings(tenantId, {
        answer_style: settings.answer_style || undefined,
        message_limit_per_chat: settings.message_limit_per_chat,
        settings: settings.settings || {},
      });
      // Show success message
      alert(t('tenants.settingsSaved'));
    } catch (error) {
      console.error('Error saving tenant settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const answerStyles = [
    { value: '', label: t('tenants.defaultStyle') },
    { value: 'short', label: t('tenants.short') },
    { value: 'formal', label: t('tenants.formal') },
    { value: 'friendly', label: t('tenants.friendly') },
    { value: 'detailed', label: t('tenants.detailed') },
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/tenants/${tenantId}`)}
            className="p-2 rounded-lg glass-button-secondary"
          >
            <ArrowLeft size={18} className="rtl-flip" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Settings size={20} className="text-cyan-400" />
              {t('nav.settings')} - {tenant?.name}
            </h1>
            <p className="text-sm text-glass-textSecondary">{t('tenants.settingsDesc')}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {t('common.save')}
        </button>
      </div>

      {/* Settings Form */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-4">{t('tenants.chatSettings')}</h2>

        <div className="space-y-4">
          {/* Answer Style */}
          <div>
            <label className="block text-sm font-medium text-glass-text mb-2">
              {t('tenants.answerStyle')}
            </label>
            <select
              value={settings.answer_style || ''}
              onChange={(e) => setSettings({ ...settings, answer_style: e.target.value as any || null })}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm"
            >
              {answerStyles.map((style) => (
                <option key={style.value} value={style.value} className="bg-slate-900">
                  {style.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-glass-textSecondary mt-1">
              {t('tenants.answerStyleDesc')}
            </p>
          </div>

          {/* Message Limit Per Chat */}
          <div>
            <label className="block text-sm font-medium text-glass-text mb-2">
              {t('tenants.messageLimitPerChat')}
            </label>
            <input
              type="number"
              value={settings.message_limit_per_chat || ''}
              onChange={(e) => setSettings({
                ...settings,
                message_limit_per_chat: e.target.value ? parseInt(e.target.value) : null
              })}
              className="glass-input w-full px-3 py-2 rounded-lg text-sm"
              placeholder={t('tenants.noLimit')}
              min="1"
            />
            <p className="text-xs text-glass-textSecondary mt-1">
              {t('tenants.messageLimitDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Style Guide */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-white mb-3">{t('tenants.answerStylesGuide')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-slate-800/50">
            <h3 className="font-medium text-cyan-400 mb-1">{t('tenants.short')}</h3>
            <p className="text-glass-textSecondary text-xs">{t('tenants.shortDesc')}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <h3 className="font-medium text-cyan-400 mb-1">{t('tenants.formal')}</h3>
            <p className="text-glass-textSecondary text-xs">{t('tenants.formalDesc')}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <h3 className="font-medium text-cyan-400 mb-1">{t('tenants.friendly')}</h3>
            <p className="text-glass-textSecondary text-xs">{t('tenants.friendlyDesc')}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50">
            <h3 className="font-medium text-cyan-400 mb-1">{t('tenants.detailed')}</h3>
            <p className="text-glass-textSecondary text-xs">{t('tenants.detailedDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSettings;
