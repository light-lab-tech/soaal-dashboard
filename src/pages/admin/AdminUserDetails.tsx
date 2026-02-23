import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { AdminUser, Subscription, Plan, Tenant } from '../../types';
import {
  User,
  ArrowLeft,
  CreditCard,
  Building2,
  Loader2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

const AdminUserDetails: React.FC = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userFromState = location.state as { user?: AdminUser } | null;

  const [user, setUser] = useState<AdminUser | null>(userFromState?.user ?? null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      navigate('/admin/users', { replace: true });
      return;
    }
    loadData();
  }, [userId, navigate]);

  const loadData = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      if (!user) {
        const usersRes = await api.getAllUsers();
        const found = usersRes.data.users?.find((u) => u.id === userId);
        if (found) setUser(found);
      }
      const [subRes, tenantsRes] = await Promise.all([
        api.getAdminUserSubscription(userId),
        api.getAdminUserTenants(userId),
      ]);
      setSubscription(subRes.data.subscription ?? null);
      setPlan(subRes.data.plan ?? null);
      setSubscriptionMessage(subRes.data.message ?? null);
      setTenants(tenantsRes.data.tenants ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-500/20 text-purple-400';
      case 'admin': return 'bg-blue-500/20 text-blue-400';
      case 'user': return 'bg-emerald-500/20 text-emerald-400';
      case 'disabled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400';
      case 'canceled': return 'text-red-400';
      case 'past_due': return 'text-amber-400';
      case 'trialing': return 'text-[#8B00E8]';
      default: return 'text-slate-400';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="p-2 rounded-lg btn-secondary text-slate-300 hover:text-white transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft size={20} className="rtl-flip" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={28} className="text-[#8B00E8]" />
            {user ? `${user.name} (${user.email})` : userId}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('admin.userManagement')} – {t('admin.subscription')} & {t('admin.userTenants')}
          </p>
        </div>
        {user && (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription */}
        <div className="glass-card p-6 card-hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-container p-2 rounded-lg bg-[#8B00E8]/10">
              <CreditCard size={22} className="text-[#8B00E8]" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t('admin.subscription')}</h2>
          </div>
          {subscription && plan ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">{t('admin.planName')}</span>
                <span className="text-white font-medium">{plan.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className={getStatusColor(subscription.status)}>{subscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Provider</span>
                <span className="text-slate-300">{subscription.provider}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 pt-2 border-t border-slate-700/50">
                <Calendar size={14} />
                <span>
                  {new Date(subscription.current_period_start).toLocaleDateString()} – {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
              {subscription.cancel_at_period_end && (
                <p className="text-amber-400 text-xs">{t('billing.cancelsAtPeriodEnd')}</p>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-slate-400">
                {subscriptionMessage || t('admin.noSubscription')}
              </p>
            </div>
          )}
        </div>

        {/* Tenants */}
        <div className="glass-card p-6 card-hover-lift">
          <div className="flex items-center gap-3 mb-4">
            <div className="icon-container p-2 rounded-lg bg-emerald-500/10">
              <Building2 size={22} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">{t('admin.userTenants')}</h2>
          </div>
          {tenants.length > 0 ? (
            <ul className="space-y-2">
              {tenants.map((tenant) => (
                <li
                  key={tenant.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                >
                  <div>
                    <span className="text-white font-medium">{tenant.name}</span>
                    <span className="ml-2 text-slate-400 text-xs">({tenant.plan})</span>
                  </div>
                  <span className={`text-xs ${tenant.status === 'active' ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {tenant.status}
                  </span>
                  <button
                    onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                    className="p-1.5 rounded-lg btn-ghost text-[#8B00E8] hover:bg-[#A855F7]/10"
                    title={t('tenants.viewDetails')}
                  >
                    <ExternalLink size={16} className="rtl-flip" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 py-4 text-center">{t('tenants.noTenantsYet')}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetails;
