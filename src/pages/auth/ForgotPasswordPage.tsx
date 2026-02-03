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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 animate-gradient-shift"></div>

          <div className="text-center pt-5 pb-4 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 mb-3 shadow-lg shadow-amber-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold mb-0.5">
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-sm text-glass-textSecondary">{t('auth.forgotPasswordTitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
            {success && (
              <div className="glass p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                {t('auth.forgotPasswordSent')}
              </div>
            )}
            {error && (
              <div className="glass p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!success && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-glass-text px-1">{t('auth.email')}</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-amber-400 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                      placeholder="user@company.com"
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 text-white hover:opacity-90 transition-opacity"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    t('auth.forgotPasswordTitle')
                  )}
                </button>
              </>
            )}

            <div className="text-center pt-3 border-t border-white/10">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium text-sm"
              >
                <ArrowLeft size={14} className="rtl-flip" />
                {t('auth.login')}
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

export default ForgotPasswordPage;
