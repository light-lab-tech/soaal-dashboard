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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 animate-gradient-shift"></div>

          <div className="text-center pt-5 pb-4 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 via-teal-500 to-cyan-600 mb-3 shadow-lg shadow-cyan-500/30">
              <Mail size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold mb-0.5">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-sm text-glass-textSecondary">{t('auth.checkEmailTitle')}</p>
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
            <p className="text-glass-text text-center text-sm">{t('auth.checkEmailMessage')}</p>

            {success && (
              <div className="glass p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                {t('auth.resendVerificationSent')}
              </div>
            )}
            {error && (
              <div className="glass p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-glass-text px-1">{t('auth.email')}</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-cyan-400 transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={hasEmailFromState ? undefined : (e) => setEmail(e.target.value)}
                    readOnly={hasEmailFromState}
                    className={`glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm ${
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
                className="glass-button w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{t('auth.resendVerificationLink')}</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-white/10">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium text-sm"
              >
                <ArrowLeft size={14} className="rtl-flip" />
                {t('auth.login')}
              </Link>
            </div>
          </div>

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

export default CheckEmailPage;
