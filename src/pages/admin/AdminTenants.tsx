import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Tenant } from '../../types';
import { Trash2, Loader2, Eye } from 'lucide-react';

const AdminTenants: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await api.getAllTenants();
      console.log('getAllTenants response:', response);
      setTenants(response.data.tenants || []);
    } catch (e) {
      console.error('Error loading tenants:', e);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTenantStatus = async (tenantId: string, newStatus: string) => {
    try {
      await api.updateTenantStatus(tenantId, { status: newStatus as 'active' | 'suspended' | 'blocked' });
      setTenants(tenants.map((t) => (t.id === tenantId ? { ...t, status: newStatus as Tenant['status'] } : t)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm(t('admin.deleteTenant') + '?')) return;
    try {
      await api.deleteTenant(tenantId);
      setTenants(tenants.filter((t) => t.id !== tenantId));
    } catch (e: any) {
      alert(e.message || 'Cannot delete tenant with existing documents.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'suspended': return 'bg-amber-500/20 text-amber-400';
      case 'blocked': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
      <div>
        <h1 className="text-2xl font-bold text-white">{t('admin.tenantManagement')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('admin.allTenants')}</p>
      </div>

      {tenants.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('admin.noTenantsFound')}</h3>
          <p className="text-slate-400 text-sm">
            Users haven't created any tenants yet. Tenants will appear here when users create them.
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto scrollbar-modern">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-start p-4 text-sm font-medium text-slate-400">{t('tenants.tenantName')}</th>
                  <th className="text-start p-4 text-sm font-medium text-slate-400">{t('tenants.plan')}</th>
                  <th className="text-start p-4 text-sm font-medium text-slate-400">{t('tenants.status')}</th>
                  <th className="text-start p-4 text-sm font-medium text-slate-400">{t('admin.createdAt')}</th>
                  <th className="text-end p-4 text-sm font-medium text-slate-400">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <button
                        onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                        className="text-white font-medium hover:text-[#8B00E8] transition-colors"
                      >
                        {tenant.name}
                      </button>
                    </td>
                    <td className="p-4"><span className="text-slate-300 capitalize">{tenant.plan}</span></td>
                    <td className="p-4">
                      <select
                        value={tenant.status}
                        onChange={(e) => handleUpdateTenantStatus(tenant.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer outline-none bg-transparent border ${getStatusBadgeColor(tenant.status)}`}
                      >
                        <option value="active" className="bg-slate-800">{t('tenants.active')}</option>
                        <option value="suspended" className="bg-slate-800">{t('tenants.suspended')}</option>
                        <option value="blocked" className="bg-slate-800">{t('tenants.blocked')}</option>
                      </select>
                    </td>
                    <td className="p-4"><span className="text-slate-400 text-sm">{tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : '—'}</span></td>
                    <td className="p-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                          className="p-2 rounded-lg btn-secondary text-[#8B00E8]"
                          title={t('common.view')}
                        >
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDeleteTenant(tenant.id)} className="p-2 rounded-lg btn-ghost text-red-400" title={t('admin.deleteTenant')}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTenants;
