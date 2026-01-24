import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { AdminUser, Tenant, UpdateUserRoleData } from '../types';
import {
  Users,
  Building2,
  Shield,
  Trash2,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';

const Admin: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'users' | 'tenants'>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'users') {
        const response = await api.getAllUsers();
        setUsers(response.data.users);
      } else {
        const response = await api.getAllTenants();
        setAllTenants(response.data.tenants);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, { role: newRole as any });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDisableUser = async (userId: string) => {
    if (!confirm('Are you sure you want to disable this user?')) return;
    try {
      await api.disableUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, role: 'disabled' } : u));
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleUpdateTenantStatus = async (tenantId: string, newStatus: string) => {
    try {
      await api.updateTenantStatus(tenantId, { status: newStatus as any });
      setAllTenants(allTenants.map(t => t.id === tenantId ? { ...t, status: newStatus as any } : t));
    } catch (error) {
      console.error('Error updating tenant status:', error);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) return;
    try {
      await api.deleteTenant(tenantId);
      setAllTenants(allTenants.filter(t => t.id !== tenantId));
    } catch (error) {
      console.error('Error deleting tenant:', error);
      alert('Cannot delete tenant with existing documents. Delete documents first or suspend the tenant instead.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/20 text-purple-400';
      case 'admin':
        return 'bg-blue-500/20 text-blue-400';
      case 'user':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'disabled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'suspended':
        return 'bg-amber-500/20 text-amber-400';
      case 'blocked':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{t('admin.title')}</h1>
        </div>
        <p className="text-glass-textSecondary ml-14">
          Manage users and tenants across the platform
        </p>
      </div>

      {/* Tabs */}
      <div className="glass px-2 py-2 rounded-xl inline-flex gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'users'
              ? 'bg-primary-500 text-white'
              : 'text-glass-text hover:text-white'
          }`}
        >
          <Users size={20} />
          {t('admin.users')}
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'tenants'
              ? 'bg-primary-500 text-white'
              : 'text-glass-text hover:text-white'
          }`}
        >
          <Building2 size={20} />
          {t('admin.allTenants')}
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-glass">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('admin.name')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('admin.email')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('admin.role')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('admin.createdAt')}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-glass-textSecondary">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{user.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-glass-text">{user.email}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer outline-none ${getRoleBadgeColor(user.role)}`}
                        disabled={user.role === 'disabled'}
                      >
                        <option value="user" className="bg-slate-900 text-white">{t('admin.userRole')}</option>
                        <option value="admin" className="bg-slate-900 text-white">{t('admin.adminRole')}</option>
                        <option value="super_admin" className="bg-slate-900 text-white">{t('admin.superAdminRole')}</option>
                        <option value="disabled" className="bg-slate-900 text-white">{t('admin.disabledRole')}</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="text-glass-text text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.role !== 'disabled' && (
                          <button
                            onClick={() => handleDisableUser(user.id)}
                            className="p-2 rounded-lg glass-button-secondary text-amber-400 hover:text-amber-300"
                            title="Disable User"
                          >
                            <Lock size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 rounded-lg glass-button-secondary text-red-400 hover:text-red-300"
                          title="Delete User"
                        >
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

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-glass">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('tenants.tenantName')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('tenants.plan')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('tenants.status')}
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-glass-textSecondary">
                    {t('admin.createdAt')}
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-glass-textSecondary">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allTenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="text-white font-medium">{tenant.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-glass-text capitalize">{tenant.plan}</span>
                    </td>
                    <td className="p-4">
                      <select
                        value={tenant.status}
                        onChange={(e) => handleUpdateTenantStatus(tenant.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer outline-none ${getStatusBadgeColor(tenant.status)}`}
                      >
                        <option value="active" className="bg-slate-900 text-white">{t('tenants.active')}</option>
                        <option value="suspended" className="bg-slate-900 text-white">{t('tenants.suspended')}</option>
                        <option value="blocked" className="bg-slate-900 text-white">{t('tenants.blocked')}</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span className="text-glass-text text-sm">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTenant(tenant.id)}
                        className="p-2 rounded-lg glass-button-secondary text-red-400 hover:text-red-300"
                        title="Delete Tenant"
                      >
                        <Trash2 size={18} />
                      </button>
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

export default Admin;
