import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Plan, CreatePlanData } from '../../types';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';

const AdminPlans: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<CreatePlanData>({
    name: '',
    slug: '',
    currency: 'USD',
    price_monthly_cents: 0,
    price_yearly_cents: 0,
    is_active: true,
    sort_order: 0,
  });

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

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      slug: '',
      description: '',
      currency: 'USD',
      price_monthly_cents: 0,
      price_yearly_cents: 0,
      is_active: true,
      sort_order: 0,
      features_summary: '',
      max_projects: undefined,
      max_messages_per_month: undefined,
      max_documents: undefined,
      max_document_size_mb: undefined,
      max_urls_ingest_per_month: undefined,
      max_api_keys_per_tenant: undefined,
      max_feedback_events_per_month: undefined,
    });
    setShowPlanModal(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      currency: plan.currency,
      price_monthly_cents: plan.price_monthly_cents,
      price_yearly_cents: plan.price_yearly_cents || 0,
      is_active: plan.is_active ?? true,
      sort_order: plan.sort_order ?? 0,
      features_summary: plan.features_summary || '',
      max_projects: plan.max_projects,
      max_messages_per_month: plan.max_messages_per_month,
      max_documents: plan.max_documents,
      max_document_size_mb: plan.max_document_size_mb,
      max_urls_ingest_per_month: plan.max_urls_ingest_per_month,
      max_api_keys_per_tenant: plan.max_api_keys_per_tenant,
      max_feedback_events_per_month: plan.max_feedback_events_per_month,
    });
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
                  <td className="p-4"><span className="text-white font-medium">{plan.name}</span></td>
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
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{editingPlan ? t('admin.editPlan') : t('admin.createPlan')}</h2>
              <button onClick={() => setShowPlanModal(false)} className="p-2 rounded-lg btn-ghost text-slate-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.planName')}</label>
                <input type="text" value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="input w-full px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.planSlug')}</label>
                <input type="text" value={planForm.slug} onChange={(e) => setPlanForm({ ...planForm, slug: e.target.value })} className="input w-full px-3 py-2" placeholder="pro" required disabled={!!editingPlan} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.planDescription')}</label>
                <input type="text" value={planForm.description || ''} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="input w-full px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.priceMonthly')}</label>
                  <input type="number" min={0} value={planForm.price_monthly_cents} onChange={(e) => setPlanForm({ ...planForm, price_monthly_cents: parseInt(e.target.value) || 0 })} className="input w-full px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.priceYearly')}</label>
                  <input type="number" min={0} value={planForm.price_yearly_cents || 0} onChange={(e) => setPlanForm({ ...planForm, price_yearly_cents: parseInt(e.target.value) || 0 })} className="input w-full px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('admin.featuresSummary')}</label>
                <input type="text" value={planForm.features_summary || ''} onChange={(e) => setPlanForm({ ...planForm, features_summary: e.target.value })} className="input w-full px-3 py-2" />
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
