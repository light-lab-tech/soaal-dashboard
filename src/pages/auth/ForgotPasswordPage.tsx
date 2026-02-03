import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Mail, ArrowLeft, Sparkles, Globe } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (i18n.language === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  }, [i18n.language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);
    try {
      await api.forgotPassword({ email });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 animate-gradient-shift"></div>

          <div className="text-center pt-8 pb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 mb-6 shadow-2xl shadow-amber-500/30">
              <Sparkles size={36} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-glow bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-base text-glass-textSecondary font-medium">{t('auth.forgotPasswordTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
            {success && (
              <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                {t('auth.forgotPasswordSent')}
              </div>
            )}
            {error && (
              <div className="glass p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!success && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-glass-text px-1">{t('auth.email')}</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-amber-400 transition-colors z-10">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base"
                      placeholder="user@company.com"
                      required
                      autoComplete="email"
                      disabled={isLoading || success}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="glass-button w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(to right, #f59e0b, #ea580c)' }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    t('auth.forgotPasswordTitle')
                  )}
                </button>
              </>
            )}

            <div className="text-center pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium"
              >
                <ArrowLeft size={18} className="rtl-flip" />
                {t('auth.login')}
              </Link>
            </div>
          </form>

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

export default ForgotPasswordPage;
