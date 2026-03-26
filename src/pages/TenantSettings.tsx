import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { Tenant, TenantSettings as TenantSettingsType } from '../types';
import RetrievalDebug from '../components/RetrievalDebug';
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Save,
  Loader2,
  Sparkles,
  MessageSquare,
  Brain,
  Shield,
  Sliders,
  Scale,
  Target,
} from 'lucide-react';

const TenantSettings: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [settings, setSettings] = useState<TenantSettingsType>({
    answer_style: null,
    message_limit_per_chat: null,
    settings: {},
    answer_quality: {
      quality_profile: 'balanced',
      enable_hybrid_search: true,
      enable_query_rewrite: true,
      enable_phrase_match: true,
      faq_threshold: 0.5,
      min_chunk_score: 0.5,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
      showToast(t('common.error'), 'error');
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
        answer_quality: settings.answer_quality,
      });
      setHasChanges(false);
      showToast(t('tenants.settingsSaved'), 'success');
    } catch (error) {
      console.error('Error saving tenant settings:', error);
      showToast(t('common.error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const answerStyles = [
    {
      value: '',
      label: t('tenants.defaultStyle'),
      icon: Brain,
      color: 'from-[#8B00E8] to-[#7C3AED]',
      desc: t('tenants.defaultStyleDesc')
    },
    {
      value: 'short',
      label: t('tenants.short'),
      icon: MessageSquare,
      color: 'from-[#8B00E8] to-[#7C3AED]',
      desc: t('tenants.shortDesc')
    },
    {
      value: 'formal',
      label: t('tenants.formal'),
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      desc: t('tenants.formalDesc')
    },
    {
      value: 'friendly',
      label: t('tenants.friendly'),
      icon: Sparkles,
      color: 'from-[#8B00E8] to-[#7C3AED]',
      desc: t('tenants.friendlyDesc')
    },
    {
      value: 'detailed',
      label: t('tenants.detailed'),
      icon: SettingsIcon,
      color: 'from-emerald-500 to-green-600',
      desc: t('tenants.detailedDesc')
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8B00E8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-300 text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            <h1 className="text-xl font-semibold text-white">{t('nav.settings')}</h1>
            <p className="text-sm text-glass-textSecondary">{tenant?.name}</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 ${
            !hasChanges ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {t('common.save')}
        </button>
      </div>

      {/* Chat Settings Card */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <SettingsIcon size={18} className="text-[#8B00E8]" />
          {t('tenants.chatSettings')}
        </h2>

        <div className="space-y-6">
          {/* Answer Style */}
          <div>
            <label className="block text-sm font-medium text-glass-text mb-3">
              {t('tenants.answerStyle')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {answerStyles.map((style) => {
                const Icon = style.icon;
                const isSelected = settings.answer_style === style.value || (style.value === '' && !settings.answer_style);
                return (
                  <button
                    key={style.value}
                    onClick={() => {
                      setSettings({ ...settings, answer_style: style.value as any || null });
                      setHasChanges(true);
                    }}
                    className={`glass-card p-3 text-left transition-all duration-200 group ${
                      isSelected ? 'ring-2 ring-[#8B00E8]/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${style.color}`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0 text-start">
                        <h3 className="text-sm font-semibold text-white mb-1 truncate">
                          {style.label}
                        </h3>
                        <p className="text-xs text-glass-textSecondary">
                          {style.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Limit Per Chat */}
          <div className="glass-card-surface p-4 rounded-xl">
            <label className="block text-sm font-medium text-glass-text mb-3">
              {t('tenants.messageLimitPerChat')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={settings.message_limit_per_chat || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSettings({
                    ...settings,
                    message_limit_per_chat: value ? parseInt(value) : null
                  });
                  setHasChanges(true);
                }}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-sm"
                placeholder={t('tenants.noLimit')}
                min="1"
              />
              <button
                onClick={() => {
                  setSettings({ ...settings, message_limit_per_chat: null });
                  setHasChanges(true);
                }}
                className="px-3 py-2 rounded-lg glass-button-secondary text-xs whitespace-nowrap"
              >
                {t('tenants.noLimit')}
              </button>
            </div>
            <p className="text-xs text-glass-textSecondary mt-2 flex items-center gap-1">
              <Shield size={12} />
              {t('tenants.messageLimitDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Answer Quality Settings Card */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Sliders size={18} className="text-[#8B00E8]" />
          {t('tenants.answerQuality')}
        </h2>

        <div className="space-y-6">
          {/* Quality Profile */}
          <div>
            <label className="block text-sm font-medium text-glass-text mb-3">
              {t('tenants.qualityProfile')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  value: 'balanced' as const,
                  label: t('tenants.balanced'),
                  desc: t('tenants.balancedDesc'),
                  icon: Scale,
                },
                {
                  value: 'precise' as const,
                  label: t('tenants.precise'),
                  desc: t('tenants.preciseDesc'),
                  icon: Target,
                },
                {
                  value: 'exploratory' as const,
                  label: t('tenants.exploratory'),
                  desc: t('tenants.exploratoryDesc'),
                  icon: Brain,
                },
              ].map((profile) => {
                const Icon = profile.icon;
                const isSelected = settings.answer_quality?.quality_profile === profile.value;
                return (
                  <button
                    key={profile.value}
                    onClick={() => {
                      setSettings({
                        ...settings,
                        answer_quality: {
                          ...settings.answer_quality!,
                          quality_profile: profile.value,
                        },
                      });
                      setHasChanges(true);
                    }}
                    className={`glass-card p-3 text-left transition-all duration-200 ${
                      isSelected ? 'ring-2 ring-[#8B00E8]/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8] to-[#7C3AED]">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-1">
                          {profile.label}
                        </h3>
                        <p className="text-xs text-glass-textSecondary">
                          {profile.desc}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Threshold */}
          <div className="glass-card-surface p-4 rounded-xl">
            <label className="block text-sm font-medium text-glass-text mb-3">
              {t('tenants.faqThreshold')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={settings.answer_quality?.faq_threshold ?? 0.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSettings({
                    ...settings,
                    answer_quality: {
                      ...settings.answer_quality!,
                      faq_threshold: Math.max(0.1, Math.min(1.0, value)),
                    },
                  });
                  setHasChanges(true);
                }}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-sm"
              />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.answer_quality?.faq_threshold ?? 0.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSettings({
                    ...settings,
                    answer_quality: {
                      ...settings.answer_quality!,
                      faq_threshold: value,
                    },
                  });
                  setHasChanges(true);
                }}
                className="w-32 accent-[#8B00E8]"
              />
            </div>
            <p className="text-xs text-glass-textSecondary mt-2">
              {t('tenants.faqThresholdDesc')}
            </p>
          </div>

          {/* Min Chunk Score */}
          <div className="glass-card-surface p-4 rounded-xl">
            <label className="block text-sm font-medium text-glass-text mb-3">
              {t('tenants.minChunkScore')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={settings.answer_quality?.min_chunk_score ?? 0.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSettings({
                    ...settings,
                    answer_quality: {
                      ...settings.answer_quality!,
                      min_chunk_score: Math.max(0.1, Math.min(1.0, value)),
                    },
                  });
                  setHasChanges(true);
                }}
                className="glass-input flex-1 px-3 py-2 rounded-lg text-sm"
              />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.answer_quality?.min_chunk_score ?? 0.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setSettings({
                    ...settings,
                    answer_quality: {
                      ...settings.answer_quality!,
                      min_chunk_score: value,
                    },
                  });
                  setHasChanges(true);
                }}
                className="w-32 accent-[#8B00E8]"
              />
            </div>
            <p className="text-xs text-glass-textSecondary mt-2">
              {t('tenants.minChunkScoreDesc')}
            </p>
          </div>

          {/* Toggle Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Enable Hybrid Search */}
            <div className="glass-card-surface p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-glass-text">
                    {t('tenants.enableHybridSearch')}
                  </label>
                  <p className="text-xs text-glass-textSecondary mt-1">
                    {t('tenants.enableHybridSearchDesc')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      answer_quality: {
                        ...settings.answer_quality!,
                        enable_hybrid_search: !settings.answer_quality?.enable_hybrid_search,
                      },
                    });
                    setHasChanges(true);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.answer_quality?.enable_hybrid_search ? 'bg-[#8B00E8]' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.answer_quality?.enable_hybrid_search ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Enable Query Rewrite */}
            <div className="glass-card-surface p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-glass-text">
                    {t('tenants.enableQueryRewrite')}
                  </label>
                  <p className="text-xs text-glass-textSecondary mt-1">
                    {t('tenants.enableQueryRewriteDesc')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      answer_quality: {
                        ...settings.answer_quality!,
                        enable_query_rewrite: !settings.answer_quality?.enable_query_rewrite,
                      },
                    });
                    setHasChanges(true);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.answer_quality?.enable_query_rewrite ? 'bg-[#8B00E8]' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.answer_quality?.enable_query_rewrite ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Enable Phrase Match */}
            <div className="glass-card-surface p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-glass-text">
                    {t('tenants.enablePhraseMatch')}
                  </label>
                  <p className="text-xs text-glass-textSecondary mt-1">
                    {t('tenants.enablePhraseMatchDesc')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      answer_quality: {
                        ...settings.answer_quality!,
                        enable_phrase_match: !settings.answer_quality?.enable_phrase_match,
                      },
                    });
                    setHasChanges(true);
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.answer_quality?.enable_phrase_match ? 'bg-[#8B00E8]' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.answer_quality?.enable_phrase_match ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retrieval Debug */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Brain size={18} className="text-[#8B00E8]" />
          {t('tenants.retrievalDebug')}
        </h2>
        <RetrievalDebug
          tenantId={tenantId!}
          currentSettings={settings.answer_quality}
        />
      </div>
    </div>
  );
};

export default TenantSettings;
