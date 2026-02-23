import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Mail, Globe, Send, Sparkles, Inbox, ArrowLeft } from 'lucide-react';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

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
  const [focusedField, setFocusedField] = useState<string | null>(null);
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
            className="absolute w-2 h-2 rounded-full bg-blue-500/20 animate-float-gentle"
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
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse-glow" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/40">
                <Inbox size={32} className="text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-blue-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent animate-text-gradient">
                Soaal
              </span>
            </h1>
            <p className="text-sm text-slate-400">{t('auth.checkEmailTitle')}</p>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5">
            {/* Illustration */}
            <div className="flex justify-center py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                  <Mail size={40} className="text-blue-400" />
                </div>
                {/* Animated rings */}
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute -inset-2 rounded-full border border-indigo-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </div>
            </div>

            <p className="text-slate-300 text-center leading-relaxed">
              {t('auth.checkEmailMessage')}
            </p>

            {success && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm animate-scale-in-bounce">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('auth.resendVerificationSent')}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-shake">
                {error}
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
                    ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}
                  `}>
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={hasEmailFromState ? undefined : (e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    readOnly={hasEmailFromState}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                             text-white placeholder-slate-500
                             focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                             focus:bg-slate-800/80 outline-none transition-all duration-300
                             ${hasEmailFromState ? 'opacity-75 cursor-not-allowed' : ''}`}
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    autoComplete="email"
                    disabled={isLoading || success}
                  />
                  {/* Focus glow effect */}
                  {!hasEmailFromState && (
                    <div className={`
                      absolute inset-0 rounded-xl bg-blue-500/10 blur-xl transition-opacity duration-300 -z-10
                      ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}
                    `} />
                  )}
                </div>
              </div>

              <AnimatedButton
                type="submit"
                variant="gradient"
                size="lg"
                isLoading={isLoading}
                isDisabled={isLoading || success || !email.trim()}
                fullWidth
                icon={<Send size={16} />}
              >
                {t('auth.resendVerificationLink')}
              </AnimatedButton>
            </form>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t border-slate-700/50">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm transition-all"
              >
                <ArrowLeft size={16} className="rtl-flip" />
                {t('auth.backToLogin')}
              </Link>
            </div>
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
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
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
    <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift bg-[length:200%_auto]" />
    
    {/* Inner card */}
    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      {children}
    </div>
  </div>
);

export default CheckEmailPage;
