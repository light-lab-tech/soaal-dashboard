import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MailCheck, Sparkles, Globe, Send } from 'lucide-react';
import { api } from '../../services/api';

const VerifyEmailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  useEffect(() => {
    if (!mounted || !token) {
      if (!token) setStatus('error');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setErrorMessage('');

    verifyEmail(token)
      .then(() => {
        if (!cancelled) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : t('auth.verifyEmailInvalid'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, mounted, verifyEmail, navigate, t]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await api.resendVerificationEmail(resendEmail.trim());
      setResendSuccess(true);
    } catch (err: unknown) {
      // Silently fail - API doesn't reveal if email exists
    } finally {
      setResendLoading(false);
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
              <Sparkles size={36} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-glow bg-gradient-to-r from-cyan-400 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-base text-glass-textSecondary font-medium">{t('auth.verifyEmail')}</p>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                <p className="text-glass-textSecondary">{t('common.loading')}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm flex items-center gap-3">
                <MailCheck size={24} className="flex-shrink-0" />
                <span>{t('auth.verifyEmailSuccess')}</span>
              </div>
            )}

            {status === 'error' && (
              <>
                <div className="glass p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                  {token ? errorMessage : t('auth.verifyEmailMissingToken')}
                </div>
                {resendSuccess && (
                  <div className="glass p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                    {t('auth.resendVerificationSent')}
                  </div>
                )}
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-glass-text px-1">{t('auth.email')}</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-cyan-400 transition-colors z-10">
                        <MailCheck size={20} />
                      </div>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="glass-input w-full pl-12 pr-4 py-3 rounded-2xl text-sm"
                        placeholder="user@company.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading || resendSuccess}
                    className="glass-button-secondary w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
                  >
                    {t('auth.login')}
                  </Link>
                </div>
              </>
            )}
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

export default VerifyEmailPage;
