import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MailCheck, Globe, Send } from 'lucide-react';
import { api } from '../../services/api';
import { Logo } from '../../components/Logo';

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
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (i18n.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [i18n.language]);

  useEffect(() => {
    if (!mounted) return;

    let cancelled = false;

    // Small delay to ensure searchParams are fully parsed
    const checkToken = setTimeout(() => {
      setHasCheckedToken(true);
      const currentToken = searchParams.get('token');

      if (!currentToken) {
        // No token found after parsing
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(t('auth.verifyEmailMissingToken'));
        }
        return;
      }

      // Token exists, proceed with verification
      if (!cancelled) {
        setStatus('loading');
        setErrorMessage('');
      }

      verifyEmail(currentToken)
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
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(checkToken);
    };
  }, [mounted, searchParams, verifyEmail, navigate, t]);

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-slide-up">
        <div className="glass-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#8B00E8] via-[#A855F7] to-[#7C3AED] animate-gradient-shift"></div>

          <div className="text-center pt-5 pb-4 px-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-brand-gradient mb-3 shadow-lg shadow-[#8B00E8]/40">
              <Logo size={28} variant="icon-only" />
            </div>
            <h1 className="text-xl font-bold mb-0.5">
              <span className="bg-gradient-to-r from-[#8B00E8] via-[#A855F7] to-[#7C3AED] bg-clip-text text-transparent">
                SoaAL
              </span>
            </h1>
            <p className="text-sm text-glass-textSecondary">{t('auth.verifyEmail')}</p>
          </div>

          <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
            {(status === 'idle' || !hasCheckedToken) && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-10 h-10 border-[3px] border-[#8B00E8]/30 border-t-[#8B00E8] rounded-full animate-spin" />
                <p className="text-glass-textSecondary text-sm">{t('common.loading')}</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-10 h-10 border-[3px] border-[#8B00E8]/30 border-t-[#8B00E8] rounded-full animate-spin" />
                <p className="text-glass-textSecondary text-sm">{t('common.loading')}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="glass p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm flex items-center gap-3">
                <MailCheck size={20} className="flex-shrink-0" />
                <span>{t('auth.verifyEmailSuccess')}</span>
              </div>
            )}

            {status === 'error' && (
              <>
                <div className="glass p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                  {token ? errorMessage : t('auth.verifyEmailMissingToken')}
                </div>
                {resendSuccess && (
                  <div className="glass p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm">
                    {t('auth.resendVerificationSent')}
                  </div>
                )}
                <form onSubmit={handleResend} className="space-y-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-glass-text px-1">{t('auth.email')}</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-glass-textSecondary group-focus-within:text-[#A855F7] transition-colors">
                        <MailCheck size={16} />
                      </div>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-sm"
                        placeholder="user@company.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resendLoading || resendSuccess}
                    className="glass-button-secondary w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {resendLoading ? (
                      <>
                        <div className="w-4 h-4 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t('common.loading')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>{t('auth.resendVerificationLink')}</span>
                      </>
                    )}
                  </button>
                </form>
                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-[#A855F7] hover:text-[#8B00E8] font-medium text-sm"
                  >
                    {t('auth.login')}
                  </Link>
                </div>
              </>
            )}
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

export default VerifyEmailPage;
