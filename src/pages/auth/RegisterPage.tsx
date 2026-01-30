import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, Sparkles, Globe } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      {/* Animated Background */}
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="glass-card overflow-hidden">
          {/* Top Accent Line */}
          <div className="h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 animate-gradient-shift"></div>
          
          {/* Header */}
          <div className="text-center pt-8 pb-6">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 mb-6 shadow-2xl shadow-pink-500/30 animate-pulse-glow">
              <Sparkles size={36} className="text-white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-glow bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-base text-glass-textSecondary font-medium">
              {t('auth.register')} {t('auth.noAccount')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {error && (
              <div className="glass p-4 rounded-2xl border border-pink-500/30 bg-pink-500/10 text-pink-400 text-sm animate-slide-up">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-glass-text px-1">
                  {t('auth.name')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors z-10">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-glass-text px-1">
                  {t('auth.email')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors z-10">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base"
                    placeholder="user@company.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-glass-text px-1">
                  {t('auth.password')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base"
                    placeholder="••••••••••"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-glass-text px-1">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-pink-400 transition-colors z-10">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base"
                    placeholder="••••••••••"
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="glass-button w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-3 shadow-lg group"
              style={{
                background: 'linear-gradient(to right, #c084fc, #db2777)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  <span>{t('auth.register')}</span>
                  <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 rtl-flip" />
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-glass-textSecondary mb-3">
                {t('auth.hasAccount')}
              </p>
              <Link
                to="/login"
                className="glass-button-secondary inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold group"
              >
                <span>{t('auth.login')}</span>
                <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 rtl-flip" />
              </Link>
            </div>
          </form>

          {/* Language Selector */}
          <div className="absolute top-4 right-4">
            <div className="glass-button-secondary px-4 py-2 rounded-2xl flex items-center gap-2">
              <Globe size={16} className="text-glass-textSecondary" />
              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-white font-medium outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English</option>
                <option value="ar" className="bg-slate-900 text-white">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
