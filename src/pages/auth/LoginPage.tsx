import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isUnverifiedEmailError } from './CheckEmailPage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, Sparkles, Globe } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Set document direction based on language
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);

    if (lang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.invalidCredentials');
      if (isUnverifiedEmailError(message)) {
        navigate('/check-email', { state: { email: formData.email }, replace: true });
        return;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card overflow-hidden">
          {/* Top Accent Line */}
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 animate-gradient-shift"></div>

          {/* Header */}
          <div className="text-center pt-5 pb-4 px-4">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 mb-3 shadow-lg shadow-cyan-500/30">
              <Sparkles size={24} className="text-white" />
            </div>

            <h1 className="text-xl font-bold mb-0.5">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-sm text-glass-textSecondary">
              {t('auth.login')} {t('auth.hasAccount')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
            {error && (
              <div className="glass p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-glass-text px-1">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-cyan-400 transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                  placeholder="user@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-glass-text px-1">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-cyan-400 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-end">
              <Link
                to="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors inline-flex items-center gap-1 group"
              >
                {t('auth.forgotPassword')}
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl-flip" />
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>{t('auth.login')}</span>
                  <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl-flip" />
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-glass-textSecondary text-xs mb-2">
                {t('auth.noAccount')}
              </p>
              <Link
                to="/register"
                className="glass-button-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium group"
              >
                <span>{t('auth.register')}</span>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl-flip" />
              </Link>
            </div>
          </form>

          {/* Language Footer */}
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-center gap-2">
            <Globe size={14} className="text-glass-textSecondary" />
            <select
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-glass-textSecondary text-xs font-medium outline-none cursor-pointer hover:text-white transition-colors"
            >
              <option value="en" className="bg-slate-800 text-white">English</option>
              <option value="ar" className="bg-slate-800 text-white">العربية</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
