import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { Mail, Lock, Globe, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const ResetPasswordPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (i18n.language === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  }, [i18n.language]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, email: emailFromUrl || prev.email }));
  }, [emailFromUrl]);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (formData.password.length >= 10) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    if (lang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
    else document.documentElement.setAttribute('dir', 'ltr');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    if (!token) {
      setError(t('auth.verifyEmailMissingToken'));
      return;
    }
    setIsLoading(true);
    try {
      await api.resetPassword({
        email: formData.email,
        token,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-amber-500';
    return 'bg-emerald-500';
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
            className="absolute w-2 h-2 rounded-full bg-amber-500/20 animate-float-gentle"
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
              <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-xl animate-pulse-glow" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/40">
                {success ? <CheckCircle2 size={32} className="text-white" /> : <KeyRound size={32} className="text-white" />}
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent animate-text-gradient">
                Soaal
              </span>
            </h1>
            <p className="text-sm text-slate-400">{t('auth.resetPassword')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {success && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 animate-scale-in-bounce">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{t('auth.resetPasswordSuccess')}</p>
                    <p className="text-xs text-emerald-300/70">{t('auth.redirecting')}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {!success && (
              <>
                {/* Email Input */}
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
                      ${focusedField === 'email' ? 'text-amber-400' : 'text-slate-500'}
                    `}>
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={emailFromUrl ? undefined : (e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      readOnly={!!emailFromUrl}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                               text-white placeholder-slate-500
                               focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 
                               focus:bg-slate-800/80 outline-none transition-all duration-300
                               ${emailFromUrl ? 'opacity-75 cursor-not-allowed' : ''}`}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                      autoComplete="email"
                      disabled={isLoading}
                    />
                    {!emailFromUrl && (
                      <div className={`
                        absolute inset-0 rounded-xl bg-amber-500/10 blur-xl transition-opacity duration-300 -z-10
                        ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}
                      `} />
                    )}
                  </div>
                </div>

                {token && (
                  <>
                    {/* New Password Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300 px-1">
                        {t('auth.newPassword')}
                      </label>
                      <div className={`
                        relative group transition-all duration-300
                        ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}
                      `}>
                        <div className={`
                          absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
                          ${focusedField === 'password' ? 'text-amber-400' : 'text-slate-500'}
                        `}>
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                                   text-white placeholder-slate-500
                                   focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 
                                   focus:bg-slate-800/80 outline-none transition-all duration-300"
                          placeholder="••••••••"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                        <div className={`
                          absolute inset-0 rounded-xl bg-amber-500/10 blur-xl transition-opacity duration-300 -z-10
                          ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}
                        `} />
                      </div>
                      {/* Password strength indicator */}
                      {formData.password && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {passwordStrength <= 1 ? t('auth.passwordWeak') : passwordStrength <= 3 ? t('auth.passwordMedium') : t('auth.passwordStrong')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-slate-300 px-1">
                        {t('auth.confirmPassword')}
                      </label>
                      <div className={`
                        relative group transition-all duration-300
                        ${focusedField === 'confirm' ? 'transform scale-[1.02]' : ''}
                      `}>
                        <div className={`
                          absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
                          ${focusedField === 'confirm' ? 'text-amber-400' : 'text-slate-500'}
                        `}>
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          onFocus={() => setFocusedField('confirm')}
                          onBlur={() => setFocusedField(null)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                                   text-white placeholder-slate-500
                                   focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 
                                   focus:bg-slate-800/80 outline-none transition-all duration-300"
                          placeholder="••••••••"
                          required
                          minLength={6}
                          autoComplete="new-password"
                          disabled={isLoading}
                        />
                        <div className={`
                          absolute inset-0 rounded-xl bg-amber-500/10 blur-xl transition-opacity duration-300 -z-10
                          ${focusedField === 'confirm' ? 'opacity-100' : 'opacity-0'}
                        `} />
                      </div>
                    </div>
                  </>
                )}

                {!token && (
                  <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {t('auth.verifyEmailMissingToken')}
                  </div>
                )}

                <AnimatedButton
                  type="submit"
                  variant="gradient"
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={isLoading || !token}
                  fullWidth
                  magnetic
                >
                  {t('auth.resetPassword')}
                </AnimatedButton>
              </>
            )}

            {!success && (
              <div className="text-center pt-4 border-t border-slate-700/50">
                <Link
                  to="/login"
                  className="text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors"
                >
                  {t('auth.login')}
                </Link>
              </div>
            )}
          </form>

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
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' 
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
    <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift bg-[length:200%_auto]" />
    
    {/* Inner card */}
    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5 pointer-events-none" />
      {children}
    </div>
  </div>
);

export default ResetPasswordPage;
