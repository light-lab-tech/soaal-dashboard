import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Plan, CreatePlanData, PlanLocalization } from '../../types';
import { Plus, Pencil, Trash2, Loader2, X, Globe, Minus } from 'lucide-react';

const AdminPlans: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form state with localizations
  const [planForm, setPlanForm] = useState<CreatePlanData>({
    slug: '',
    currency: 'USD',
    price_monthly_cents: 0,
    price_yearly_cents: 0,
    is_active: true,
    sort_order: 0,
    localizations: [
      {
        language_code: 'en',
        name: '',
        description: '',
        features_summary: '',
      }
    ],
  });

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'العربية' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'tr', name: 'Türkçe' },
  ];

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/admin', { replace: true });
      return;
    }
    loadData();
  }, [user?.role, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminPlans();
      setPlans(response.data.plans || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialFormData = (): CreatePlanData => ({
    slug: '',
    currency: 'USD',
    price_monthly_cents: 0,
    price_yearly_cents: 0,
    discount_monthly_cents: 0,
    discount_yearly_cents: 0,
    is_active: true,
    sort_order: 0,
    localizations: [
      {
        language_code: 'en',
        name: '',
        description: '',
        features_summary: '',
      }
    ],
    max_projects: undefined,
    max_messages_per_month: undefined,
    max_documents: undefined,
    max_document_size_mb: undefined,
    max_urls_ingest_per_month: undefined,
    max_pending_questions_per_month: undefined,
    max_telegram_bots: undefined,
    max_api_keys_per_tenant: undefined,
    max_feedback_events_per_month: undefined,
    enable_telegram_integration: undefined,
    enable_feedback: undefined,
    enable_hil: undefined,
    enable_custom_system_prompt: undefined,
    enable_rag_enhancements: undefined,
    enable_analytics_dashboard: undefined,
    enable_priority_support: undefined,
    enable_custom_domain: undefined,
    enable_webhook_integrations: undefined,
  });

  const planToFormData = (plan: Plan): CreatePlanData => {
    // If the plan has localizations, use them; otherwise create a default EN localization from the plan's properties
    const localizations = plan.localizations && plan.localizations.length > 0
      ? [...plan.localizations]
      : [{
          language_code: 'en',
          name: plan.name,
          description: plan.description || '',
          features_summary: plan.features_summary || '',
        }];

    return {
      slug: plan.slug,
      currency: plan.currency,
      price_monthly_cents: plan.price_monthly_cents,
      price_yearly_cents: plan.price_yearly_cents || 0,
      discount_monthly_cents: plan.discount_monthly_cents || 0,
      discount_yearly_cents: plan.discount_yearly_cents || 0,
      is_active: plan.is_active ?? true,
      sort_order: plan.sort_order ?? 0,
      localizations,
      max_projects: plan.max_projects,
      max_messages_per_month: plan.max_messages_per_month,
      max_documents: plan.max_documents,
      max_document_size_mb: plan.max_document_size_mb,
      max_urls_ingest_per_month: plan.max_urls_ingest_per_month,
      max_pending_questions_per_month: plan.max_pending_questions_per_month,
      max_telegram_bots: plan.max_telegram_bots,
      max_api_keys_per_tenant: plan.max_api_keys_per_tenant,
      max_feedback_events_per_month: plan.max_feedback_events_per_month,
      enable_telegram_integration: plan.enable_telegram_integration,
      enable_feedback: plan.enable_feedback,
      enable_hil: plan.enable_hil,
      enable_custom_system_prompt: plan.enable_custom_system_prompt,
      enable_rag_enhancements: plan.enable_rag_enhancements,
      enable_analytics_dashboard: plan.enable_analytics_dashboard,
      enable_priority_support: plan.enable_priority_support,
      enable_custom_domain: plan.enable_custom_domain,
      enable_webhook_integrations: plan.enable_webhook_integrations,
    };
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm(getInitialFormData());
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm(planToFormData(plan));
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan.id, planForm);
      } else {
        await api.createPlan(planForm);
      }
      setShowPlanModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm(t('admin.deletePlan') + '?')) return;
    try {
      await api.deletePlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
    } catch (err: any) {
      alert(err.message || 'Failed to deactivate plan');
    }
  };

  const updateLocalization = (index: number, field: keyof PlanLocalization, value: string) => {
    const newLocalizations = [...planForm.localizations!];
    newLocalizations[index] = {
      ...newLocalizations[index],
      [field]: value,
    };
    setPlanForm({ ...planForm, localizations: newLocalizations });
  };

  const addLocalization = (languageCode: string) => {
    // Check if this language already exists
    if (planForm.localizations?.some(l => l.language_code === languageCode)) {
      return;
    }
    const newLocalizations = [
      ...planForm.localizations!,
      {
        language_code: languageCode,
        name: '',
        description: '',
        features_summary: '',
      }
    ];
    setPlanForm({ ...planForm, localizations: newLocalizations });
  };

  const removeLocalization = (index: number) => {
    // Don't allow removing the last localization
    if (planForm.localizations!.length <= 1) {
      return;
    }
    const newLocalizations = planForm.localizations!.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, localizations: newLocalizations });
  };

  const getEnglishName = (plan: Plan): string => {
    if (plan.localizations && plan.localizations.length > 0) {
      const en = plan.localizations.find(l => l.language_code === 'en');
      if (en) return en.name;
    }
    return plan.name;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3 p-6">
          <Loader2 size={24} className="animate-spin text-[#8B00E8]" />
          <span className="text-white">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.planManagement')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('billing.plans')}</p>
        </div>
        <button onClick={openCreatePlan} className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} />
          {t('admin.createPlan')}
        </button>
      </div>

      <div className="glass-card overflow-hidden p-0">
        <div className="overflow-x-auto scrollbar-modern">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-start p-4 text-sm font-medium text-slate-400">{t('admin.planName')}</th>
                <th className="text-start p-4 text-sm font-medium text-slate-400">{t('admin.planSlug')}</th>
                <th className="text-start p-4 text-sm font-medium text-slate-400">Price (monthly)</th>
                <th className="text-start p-4 text-sm font-medium text-slate-400">{t('documents.tableActive')}</th>
                <th className="text-end p-4 text-sm font-medium text-slate-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <span className="text-white font-medium">{getEnglishName(plan)}</span>
                    {plan.localizations && plan.localizations.length > 1 && (
                      <span className="ml-2 text-xs text-slate-500">({plan.localizations.length} languages)</span>
                    )}
                  </td>
                  <td className="p-4"><span className="text-slate-400">{plan.slug}</span></td>
                  <td className="p-4"><span className="text-slate-300">{plan.currency} ${(plan.price_monthly_cents / 100).toFixed(2)}/mo</span></td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${plan.is_active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {plan.is_active !== false ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditPlan(plan)} className="p-2 rounded-lg btn-secondary text-[#8B00E8]" title={t('admin.editPlan')}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-2 rounded-lg btn-ghost text-red-400" title={t('admin.deletePlan')}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {plans.length === 0 && <div className="p-8 text-center text-slate-400">{t('billing.noPlansYet')}</div>}
      </div>

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{editingPlan ? t('admin.editPlan') : t('admin.createPlan')}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-lg btn-ghost text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.planSlug')}</label>
                  <input type="text" value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })} className="input w-full px-3 py-2" placeholder="pro" required disabled={!!editingPlan} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.planCurrency')}</label>
                  <select value={planForm.currency} onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })} className="input w-full px-3 py-2" required>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.priceMonthly')} (cents)</label>
                  <input type="number" min={0} value={planForm.price_monthly_cents} onChange={(e) => setPlanForm({ ...planForm, price_monthly_cents: parseInt(e.target.value) || 0 })} className="input w-full px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.priceYearly')} (cents)</label>
                  <input type="number" min={0} value={planForm.price_yearly_cents || 0} onChange={(e) => setPlanForm({ ...planForm, price_yearly_cents: parseInt(e.target.value) || 0 })} className="input w-full px-3 py-2" />
                </div>
              </div>

              {/* Localizations */}
              <div className="border-t border-slate-700/50 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe size={16} />
                    Localizations
                  </h3>
                  <select
                    className="input px-2 py-1 text-sm"
                    onChange={(e) => {
                      const code = e.target.value;
                      if (code) addLocalization(code);
                      // Reset select
                      e.target.value = '';
                    }}
                    value=""
                  >
                    <option value="">+ Add Language</option>
                    {availableLanguages
                      .filter(lang => !planForm.localizations?.some(l => l.language_code === lang.code))
                      .map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-3">
                  {planForm.localizations?.map((localization, index) => {
                    const langInfo = availableLanguages.find(l => l.code === localization.language_code);
                    const langName = langInfo?.name || localization.language_code;

                    return (
                      <div key={index} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{langName}</span>
                          {planForm.localizations!.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLocalization(index)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <Minus size={14} />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Name *</label>
                            <input
                              type="text"
                              value={localization.name}
                              onChange={(e) => updateLocalization(index, 'name', e.target.value)}
                              className="input w-full px-2 py-1.5 text-sm"
                              required={index === 0}
                              placeholder="Pro"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Features Summary</label>
                            <input
                              type="text"
                              value={localization.features_summary || ''}
                              onChange={(e) => updateLocalization(index, 'features_summary', e.target.value)}
                              className="input w-full px-2 py-1.5 text-sm"
                              placeholder="10 projects, 50k messages/mo"
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                          <input
                            type="text"
                            value={localization.description || ''}
                            onChange={(e) => updateLocalization(index, 'description', e.target.value)}
                            className="input w-full px-2 py-1.5 text-sm"
                            placeholder="For growing teams"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plan Limits */}
              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Plan Limits</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Projects</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_projects ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_projects: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Documents</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_documents ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_documents: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Messages/Month</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_messages_per_month ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_messages_per_month: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Document Size (MB)</label>
                    <input
                      type="number"
                      min={0}
                      placeholder="10"
                      value={planForm.max_document_size_mb ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_document_size_mb: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max URL Ingests/Month</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_urls_ingest_per_month ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_urls_ingest_per_month: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Pending Questions/Month</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_pending_questions_per_month ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_pending_questions_per_month: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Telegram Bots</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_telegram_bots ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_telegram_bots: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max API Keys/Tenant</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_api_keys_per_tenant ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_api_keys_per_tenant: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Max Feedback Events/Month</label>
                    <input
                      type="number"
                      min={-1}
                      placeholder="-1 = unlimited"
                      value={planForm.max_feedback_events_per_month ?? ''}
                      onChange={(e) => setPlanForm({ ...planForm, max_feedback_events_per_month: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="input w-full px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="border-t border-slate-700/50 pt-4">
                <h3 className="text-sm font-medium text-slate-300 mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'enable_telegram_integration', label: 'Telegram Integration' },
                    { key: 'enable_feedback', label: 'Feedback' },
                    { key: 'enable_hil', label: 'HIL' },
                    { key: 'enable_custom_system_prompt', label: 'Custom System Prompt' },
                    { key: 'enable_rag_enhancements', label: 'RAG Enhancements' },
                    { key: 'enable_analytics_dashboard', label: 'Analytics Dashboard' },
                    { key: 'enable_priority_support', label: 'Priority Support' },
                    { key: 'enable_custom_domain', label: 'Custom Domain' },
                    { key: 'enable_webhook_integrations', label: 'Webhook Integrations' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={planForm[key as keyof CreatePlanData] as boolean | undefined}
                        onChange={(e) => setPlanForm({ ...planForm, [key]: e.target.checked })}
                        className="rounded"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowPlanModal(false)} className="btn-secondary flex-1 py-2">{t('common.cancel')}</button>
                <button type="submit" className="btn-primary flex-1 py-2">{editingPlan ? t('common.update') : t('common.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
