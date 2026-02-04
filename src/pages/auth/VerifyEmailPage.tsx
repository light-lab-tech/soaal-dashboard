import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MailCheck, Globe, Send, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

import { AnimatedButton } from '../../components/ui/AnimatedButton';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

    const checkToken = setTimeout(() => {
      setHasCheckedToken(true);
      const currentToken = searchParams.get('token');

      if (!currentToken) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(t('auth.verifyEmailMissingToken'));
        }
        return;
      }

      if (!cancelled) {
        setStatus('loading');
        setErrorMessage('');
      }

      verifyEmail(currentToken)
        .then(() => {
          if (!cancelled) {
            setStatus('success');
            setTimeout(() => navigate('/dashboard', { replace: true }), 2000);
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
      // Silently fail
    } finally {
      setResendLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="background-container">
        <div className="background-orb orb-1"></div>
        <div className="background-orb orb-2"></div>
        <div className="background-orb orb-3"></div>
        <div className="background-orb orb-4"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-emerald-500/20 animate-float-gentle"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i}s`,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md animate-page-enter">
        <FeaturedGradientCard>
          {/* Header */}
          <div className="text-center pt-6 pb-5 px-6">
            {/* Logo with glow */}
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse-glow" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                {status === 'success' ? (
                  <ShieldCheck size={32} className="text-white" />
                ) : status === 'error' ? (
                  <AlertCircle size={32} className="text-white" />
                ) : (
                  <MailCheck size={32} className="text-white" />
                )}
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-text-gradient">
                Soaal
              </span>
            </h1>
            <p className="text-sm text-slate-400">{t('auth.verifyEmail')}</p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-4">
            {(status === 'idle' || !hasCheckedToken) && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-3 border-transparent border-b-emerald-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-slate-400 text-sm">{t('common.loading')}</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-3 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-3 border-transparent border-b-emerald-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <p className="text-slate-400 text-sm">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-scale-in-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('auth.verifyEmailSuccess')}</p>
                    <p className="text-xs text-emerald-300/70">Redirecting to dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <>
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{token ? errorMessage : t('auth.verifyEmailMissingToken')}</span>
                  </div>
                </div>
                
                {resendSuccess && (
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm animate-scale-in-bounce">
                    {t('auth.resendVerificationSent')}
                  </div>
                )}

                <form onSubmit={handleResend} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300 px-1">
                      {t('auth.email')}
                    </label>
                    <div className={`
                      relative group transition-all duration-300
                      ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}
                    `}>
                      <div className={`
                        absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
                        ${focusedField === 'email' ? 'text-emerald-400' : 'text-slate-500'}
                      `}>
                        <MailCheck size={18} />
                      </div>
                      <input
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                                 text-white placeholder-slate-500
                                 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 
                                 focus:bg-slate-800/80 outline-none transition-all duration-300"
                        placeholder="user@company.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <AnimatedButton
                    type="submit"
                    variant="gradient"
                    size="md"
                    isLoading={resendLoading}
                    fullWidth
                    icon={<Send size={16} />}
                  >
                    {t('auth.resendVerificationLink')}
                  </AnimatedButton>
                </form>

                <div className="text-center pt-2">
                  <Link
                    to="/login"
                    className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors"
                  >
                    {t('auth.login')}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Language Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-center gap-3">
            <Globe size={16} className="text-slate-500" />
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-full p-1">
              {['en', 'ar'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                    ${i18n.language === lang 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                      : 'text-slate-400 hover:text-white'}
                  `}
                >
                  {lang === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          </div>
        </FeaturedGradientCard>
      </div>
    </div>
  );
};

// Featured gradient card component
const FeaturedGradientCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative group">
    {/* Animated gradient border */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift bg-[length:200%_auto]" />
    
    {/* Inner card */}
    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
      {children}
    </div>
  </div>
);

export default VerifyEmailPage;
