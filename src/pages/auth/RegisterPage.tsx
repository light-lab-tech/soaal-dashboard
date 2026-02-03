import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, Sparkles, Globe } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.name || undefined);
      setSuccess(true);
      // Clear form on success
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-gradient-shift"></div>

          {/* Header */}
          <div className="text-center pt-5 pb-4 px-4">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 mb-3 shadow-lg shadow-pink-500/30">
              <Sparkles size={24} className="text-white" />
            </div>

            <h1 className="text-xl font-bold mb-0.5">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-sm text-glass-textSecondary">
              {t('auth.register')} {t('auth.noAccount')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
            {success && (
              <div className="glass p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                {t('auth.checkEmailVerify')}
                <div className="mt-2">
                  <Link
                    to="/login"
                    className="text-emerald-300 hover:text-emerald-200 font-medium underline"
                  >
                    {t('auth.login')}
                  </Link>
                </div>
              </div>
            )}
            {error && (
              <div className="glass p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!success && (
              <div className="space-y-3">
                {/* Name Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-glass-text px-1">
                    {t('auth.name')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                      placeholder="John Doe"
                      required
                      autoComplete="name"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-glass-text px-1">
                    {t('auth.email')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors">
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-glass-text px-1">
                    {t('auth.password')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-glass-text px-1">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!success && (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>{t('auth.register')}</span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all rtl-flip" />
                  </>
                )}
              </button>
            )}

            {/* Login Link */}
            <div className="text-center pt-3 border-t border-white/10">
              <p className="text-glass-textSecondary text-xs mb-2">
                {t('auth.hasAccount')}
              </p>
              <Link
                to="/login"
                className="glass-button-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium group"
              >
                <span>{t('auth.login')}</span>
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

export default RegisterPage;
