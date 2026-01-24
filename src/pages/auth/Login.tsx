import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 mb-4">
          <LogIn size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('auth.login')}</h2>
        <p className="text-glass-textSecondary mt-2">{t('auth.hasAccount')}</p>
      </div>

      {error && (
        <div className="glass p-4 rounded-xl border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
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
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
          >
            {t('auth.forgotPassword')}
          </Link>
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
            <LogIn size={20} />
            {t('auth.login')}
          </>
        )}
      </button>

      <div className="text-center">
        <span className="text-glass-textSecondary">{t('auth.noAccount')} </span>
        <Link
          to="/register"
          className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
        >
          {t('auth.register')}
        </Link>
      </div>
    </form>
  );
};

export default Login;
