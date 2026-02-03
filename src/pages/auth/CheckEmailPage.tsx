import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Mail, ArrowLeft, Globe, Send } from 'lucide-react';

/** Check if login failed due to unverified email (for redirect from login) */
export function isUnverifiedEmailError(message: string): boolean {
  return message.toLowerCase().includes('verify your email');
}

const CheckEmailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string } | null)?.email ?? '';

  const [email, setEmail] = useState(emailFromState);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasEmailFromState = !!emailFromState;

  useEffect(() => {
    setMounted(true);
    if (i18n.language === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  }, [i18n.language]);

  useEffect(() => {
    if (emailFromState) setEmail(emailFromState);
  }, [emailFromState]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!email.trim()) {
      setError(t('auth.email') + ' is required');
      return;
    }
    setIsLoading(true);
    try {
      await api.resendVerificationEmail(email.trim());
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
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 animate-gradient-shift"></div>

          <div className="text-center pt-8 pb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 mb-6 shadow-2xl shadow-cyan-500/30">
              <Mail size={36} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-glow bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-base text-glass-textSecondary font-medium">{t('auth.checkEmailTitle')}</p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            <p className="text-glass-text text-center">{t('auth.checkEmailMessage')}</p>

            {success && (
              <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                {t('auth.resendVerificationSent')}
              </div>
            )}
            {error && (
              <div className="glass p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-glass-text px-1">{t('auth.email')}</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-cyan-400 transition-colors z-10">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={hasEmailFromState ? undefined : (e) => setEmail(e.target.value)}
                    readOnly={hasEmailFromState}
                    className={`glass-input w-full pl-12 pr-4 py-4 rounded-2xl text-base ${
                      hasEmailFromState ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    placeholder="user@company.com"
                    required
                    autoComplete="email"
                    disabled={isLoading || success}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading || success || !email.trim()}
                className="glass-button w-full py-4 rounded-2xl text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    <span>{t('auth.resendVerificationLink')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-white/10">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <ArrowLeft size={18} className="rtl-flip" />
                {t('auth.login')}
              </Link>
            </div>
          </div>

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

export default CheckEmailPage;
