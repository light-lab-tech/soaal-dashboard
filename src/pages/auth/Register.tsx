import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
          <UserPlus size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('auth.register')}</h2>
        <p className="text-glass-textSecondary mt-2">{t('auth.noAccount')}</p>
      </div>

      {error && (
        <div className="glass p-4 rounded-xl border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-glass-text mb-2">{t('auth.name')}</label>
          <div className="relative">
            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-glass-text mb-2">{t('auth.email')}</label>
          <div className="relative">
            <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              placeholder="user@company.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-glass-text mb-2">{t('auth.password')}</label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-glass-text mb-2">{t('auth.confirmPassword')}</label>
          <div className="relative">
            <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary" />
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="glass-input w-full pl-12 pr-4 py-3 rounded-xl"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="glass-button w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            {t('common.loading')}
          </>
        ) : (
          <>
            <UserPlus size={20} />
            {t('auth.register')}
          </>
        )}
      </button>

      <div className="text-center">
        <span className="text-glass-textSecondary">{t('auth.hasAccount')} </span>
        <Link
          to="/login"
          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
        >
          {t('auth.login')}
        </Link>
      </div>
    </form>
  );
};

export default Register;
