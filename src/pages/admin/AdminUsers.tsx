import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import type { AdminUser, UpdateUserRoleData } from '../../types';
import { Trash2, Lock, Loader2 } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAllUsers();
      setUsers(response.data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, { role: newRole as UpdateUserRoleData['role'] });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole as AdminUser['role'] } : u)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisableUser = async (userId: string) => {
    if (!confirm(t('admin.disableUser') + '?')) return;
    try {
      await api.disableUser(userId);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: 'disabled' } : u)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('admin.deleteUser') + '?')) return;
    try {
      await api.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (e) {
      console.error(e);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3 p-6">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-white">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('admin.userManagement')}</h1>
        <p className="text-slate-400 text-sm mt-1">{t('admin.users')}</p>
      </div>
      <div className="glass-card overflow-hidden p-0">
        <div className="overflow-x-auto scrollbar-modern">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-sm font-medium text-slate-400">{t('admin.name')}</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">{t('admin.email')}</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">{t('admin.role')}</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">{t('admin.createdAt')}</th>
                <th className="text-right p-4 text-sm font-medium text-slate-400">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                  <td className="p-4"><span className="text-white font-medium">{user.name}</span></td>
                  <td className="p-4"><span className="text-slate-300">{user.email}</span></td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer outline-none bg-transparent border ${getRoleBadgeColor(user.role)}`}
                      disabled={user.role === 'disabled'}
                    >
                      <option value="user" className="bg-slate-800">{t('admin.userRole')}</option>
                      <option value="admin" className="bg-slate-800">{t('admin.adminRole')}</option>
                      <option value="super_admin" className="bg-slate-800">{t('admin.superAdminRole')}</option>
                      <option value="disabled" className="bg-slate-800">{t('admin.disabledRole')}</option>
                    </select>
                  </td>
                  <td className="p-4"><span className="text-slate-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</span></td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.role !== 'disabled' && (
                        <button onClick={() => handleDisableUser(user.id)} className="p-2 rounded-lg btn-secondary text-amber-400" title={t('admin.disableUser')}>
                          <Lock size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg btn-ghost text-red-400" title={t('admin.deleteUser')}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="p-8 text-center text-slate-400">No users</div>}
      </div>
    </div>
  );
};

export default AdminUsers;
