import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
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
  const { showToast } = useToast();
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
      showToast(err.message || 'Checkout failed', 'error');
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
      showToast(t('billing.planChanged'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to change plan', 'error');
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
      showToast(t('billing.gatewayChanged'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to change payment method', 'error');
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
      showToast(t('billing.subscriptionCancelled'), 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#8B00E8]" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white mb-0.5">{t('billing.title')}</h1>
        <p className="text-sm text-glass-textSecondary">{t('billing.mySubscription')}</p>
      </div>

      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={loadData} className="glass-button-secondary px-3 py-1 rounded-lg text-xs">
              {t('questions.tryAgain')}
            </button>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      {subscription && currentPlan && (
        <div className="glass-card p-4 border-[#8B00E8]/30 bg-[#A855F7]/5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-base font-semibold text-white mb-1">{t('billing.currentPlan')}</h2>
              <p className="text-[#8B00E8] font-medium">{currentPlan.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-glass-textSecondary">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {t('billing.periodStarts')}: {new Date(subscription.current_period_start).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {t('billing.periodEnds')}: {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard size={12} />
                  {t('billing.provider')}: {subscription.provider === 'stripe' ? t('billing.stripe') : t('billing.cryptocloud')}
                </span>
              </div>
              {subscription.cancel_at_period_end && (
                <p className="mt-2 text-amber-400 text-xs">{t('billing.cancelAtPeriodEnd')}</p>
              )}
            </div>
            <div className="flex flex-row sm:flex-col gap-2">
              <button
                onClick={() => handleChangeGateway(subscription.provider === 'stripe' ? 'cryptocloud' : 'stripe')}
                disabled={!!actionLoading}
                className="glass-button-secondary px-3 py-2 text-xs flex items-center gap-1.5"
              >
                {actionLoading === 'change-gateway' ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {t('billing.changeGateway')}
              </button>
              {!subscription.cancel_at_period_end && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={!!actionLoading}
                  className="glass-button-secondary px-3 py-2 text-xs flex items-center gap-1.5 text-red-400 hover:bg-red-500/10"
                >
                  {actionLoading === 'cancel' ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                  {t('billing.cancelSubscription')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No subscription */}
      {!subscription && (
        <div className="glass-card p-6 text-center">
          <CreditCard size={36} className="mx-auto mb-3 text-glass-textSecondary" />
          <h3 className="text-base font-semibold text-white mb-1">{t('billing.noSubscription')}</h3>
          <p className="text-sm text-glass-textSecondary">{t('billing.noSubscriptionDesc')}</p>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-sm font-medium text-glass-textSecondary mb-3">{t('billing.plans')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {plans.filter(p => p.is_active !== false).map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`glass-card p-4 ${isCurrent ? 'ring-2 ring-[#8B00E8]/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">{plan.name}</h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#A855F7]/20 text-[#8B00E8]">
                      {t('billing.currentPlan')}
                    </span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-glass-textSecondary text-xs mb-2">{plan.description}</p>
                )}
                {plan.features_summary && (
                  <p className="text-glass-text text-[10px] mb-3">{plan.features_summary}</p>
                )}
                <div className="mb-3">
                  <span className="text-xl font-bold text-white">
                    {formatPrice(plan.price_monthly_cents, 'monthly')}
                  </span>
                  {plan.price_yearly_cents != null && (
                    <p className="text-glass-text text-[10px] mt-1">
                      {formatPrice(plan.price_yearly_cents, 'yearly')} — {t('billing.saveYearly')}
                    </p>
                  )}
                </div>
                {!subscription ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleCheckout(plan.id, 'stripe', 'monthly')}
                      disabled={!!checkoutLoading}
                      className="glass-button w-full py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      {checkoutLoading === `${plan.id}-stripe-monthly` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          {t('billing.checkout')} (Stripe) <ExternalLink size={12} className="rtl-flip" />
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCheckout(plan.id, 'cryptocloud', 'monthly')}
                      disabled={!!checkoutLoading}
                      className="glass-button-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                    >
                      {checkoutLoading === `${plan.id}-cryptocloud-monthly` ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        t('billing.checkout') + ' (Crypto)'
                      )}
                    </button>
                  </div>
                ) : !isCurrent && (
                  <button
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={!!actionLoading}
                    className="glass-button-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    {actionLoading === 'change-plan' ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {t('billing.changePlan')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {plans.length === 0 && !error && (
          <div className="glass-card p-6 text-center text-glass-textSecondary">
            {t('billing.noSubscriptionDesc')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
