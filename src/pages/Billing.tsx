import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Plan, Subscription } from '../types';
import {
  CreditCard,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react';

const Billing: React.FC = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [plansRes, subRes] = await Promise.all([
        api.listPlans(),
        api.getSubscription(),
      ]);
      setPlans(plansRes.data.plans || []);
      setSubscription(subRes.data.subscription || null);
      setCurrentPlan(subRes.data.plan || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number, period: 'monthly' | 'yearly') => {
    const amount = cents / 100;
    return period === 'yearly' ? `$${amount}${t('billing.perYear')}` : `$${amount}${t('billing.perMonth')}`;
  };

  const handleCheckout = async (planId: string, provider: 'stripe' | 'cryptocloud', period: 'monthly' | 'yearly') => {
    try {
      setCheckoutLoading(`${planId}-${provider}-${period}`);
      const res = await api.createCheckout({ plan_id: planId, provider, period });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!confirm(t('billing.changePlan') + '?')) return;
    try {
      setActionLoading('change-plan');
      await api.changePlan(planId);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change plan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeGateway = async (provider: 'stripe' | 'cryptocloud') => {
    if (!confirm(t('billing.changeGateway') + '?')) return;
    try {
      setActionLoading('change-gateway');
      await api.changeGateway(provider);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to change payment method');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm(t('billing.cancelSubscription') + '? ' + t('billing.cancelAtPeriodEnd'))) return;
    try {
      setActionLoading('cancel');
      await api.cancelSubscription();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="card flex items-center gap-3 p-6">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-white">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white mb-1">{t('billing.title')}</h1>
        <p className="text-slate-400 text-sm">{t('billing.mySubscription')}</p>
      </div>

      {error && (
        <div className="card p-4 border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
          <button onClick={loadData} className="ml-3 btn-secondary px-3 py-1 rounded text-xs">
            {t('questions.tryAgain')}
          </button>
        </div>
      )}

      {/* Current Subscription */}
      {subscription && currentPlan && (
        <div className="card p-6 border-cyan-500/30 bg-cyan-500/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">{t('billing.currentPlan')}</h2>
              <p className="text-cyan-400 font-medium">{currentPlan.name}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {t('billing.periodStarts')}: {new Date(subscription.current_period_start).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {t('billing.periodEnds')}: {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard size={14} />
                  {t('billing.provider')}: {subscription.provider === 'stripe' ? t('billing.stripe') : t('billing.cryptocloud')}
                </span>
              </div>
              {subscription.cancel_at_period_end && (
                <p className="mt-2 text-amber-400 text-sm">{t('billing.cancelAtPeriodEnd')}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleChangeGateway(subscription.provider === 'stripe' ? 'cryptocloud' : 'stripe')}
                disabled={!!actionLoading}
                className="btn-secondary px-4 py-2 text-sm flex items-center gap-2"
              >
                {actionLoading === 'change-gateway' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {t('billing.changeGateway')}
              </button>
              {!subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={!!actionLoading}
                  className="btn-ghost text-red-400 hover:bg-red-500/10 px-4 py-2 text-sm"
                >
                  {actionLoading === 'cancel' ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                  {t('billing.cancelSubscription')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No subscription */}
      {!subscription && (
        <div className="card p-6 text-center border-slate-600/50">
          <CreditCard size={40} className="mx-auto mb-3 text-slate-500" />
          <h3 className="text-lg font-semibold text-white mb-1">{t('billing.noSubscription')}</h3>
          <p className="text-slate-400 text-sm mb-4">{t('billing.noSubscriptionDesc')}</p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">{t('billing.plans')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.filter(p => p.is_active !== false).map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`card p-6 ${isCurrent ? 'border-cyan-500/50 ring-1 ring-cyan-500/30' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">
                      {t('billing.currentPlan')}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-slate-400 text-sm mb-3">{plan.description}</p>
                )}
                {plan.features_summary && (
                  <p className="text-slate-500 text-xs mb-4">{plan.features_summary}</p>
                )}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(plan.price_monthly_cents, 'monthly')}
                  </span>
                  {plan.price_yearly_cents != null && (
                    <p className="text-slate-500 text-xs mt-1">
                      {formatPrice(plan.price_yearly_cents, 'yearly')} — {t('billing.saveYearly')}
                    </p>
                  )}
                </div>
                {!subscription ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCheckout(plan.id, 'stripe', 'monthly')}
                      disabled={!!checkoutLoading}
                      className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
                    >
                      {checkoutLoading === `${plan.id}-stripe-monthly` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          {t('billing.checkout')} (Stripe) <ExternalLink size={14} className="rtl-flip" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCheckout(plan.id, 'cryptocloud', 'monthly')}
                      disabled={!!checkoutLoading}
                      className="btn-secondary w-full py-2 text-sm flex items-center justify-center gap-2"
                    >
                      {checkoutLoading === `${plan.id}-cryptocloud-monthly` ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        t('billing.checkout') + ' (Crypto)'
                      )}
                    </button>
                  </div>
                ) : !isCurrent && (
                  <button
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={!!actionLoading}
                    className="btn-secondary w-full py-2 text-sm flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'change-plan' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {t('billing.changePlan')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {plans.length === 0 && !error && (
          <div className="card p-8 text-center text-slate-400">
            {t('billing.noSubscriptionDesc')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
