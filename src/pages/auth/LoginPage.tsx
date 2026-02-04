import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isUnverifiedEmailError } from './CheckEmailPage';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Mail, Lock, Globe, Sparkles } from 'lucide-react';
import { Logo } from '../../components/Logo';
import { AnimatedButton } from '../../components/ui/AnimatedButton';


const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.invalidCredentials');
      if (isUnverifiedEmailError(message)) {
        navigate('/check-email', { state: { email: formData.email }, replace: true });
        return;
      }
      setError(message);
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
            className="absolute w-2 h-2 rounded-full bg-purple-500/20 animate-float-gentle"
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
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl animate-pulse-glow" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/40">
                <Logo size={32} variant="icon-only" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-purple-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>

            <h1 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-text-gradient">
                Soaal
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              {t('auth.login')} {t('auth.hasAccount')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
            {error && (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

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
                  ${focusedField === 'email' ? 'text-purple-400' : 'text-slate-500'}
                `}>
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                           text-white placeholder-slate-500
                           focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                           focus:bg-slate-800/80 outline-none transition-all duration-300"
                  placeholder="user@company.com"
                  required
                  autoComplete="email"
                />
                {/* Focus glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl bg-purple-500/10 blur-xl transition-opacity duration-300 -z-10
                  ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}
                `} />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300 px-1">
                {t('auth.password')}
              </label>
              <div className={`
                relative group transition-all duration-300
                ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}
              `}>
                <div className={`
                  absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300
                  ${focusedField === 'password' ? 'text-purple-400' : 'text-slate-500'}
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
                           focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                           focus:bg-slate-800/80 outline-none transition-all duration-300"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                {/* Focus glow effect */}
                <div className={`
                  absolute inset-0 rounded-xl bg-purple-500/10 blur-xl transition-opacity duration-300 -z-10
                  ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}
                `} />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors relative group"
              >
                {t('auth.forgotPassword')}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-purple-400 group-hover:w-full transition-all duration-300" />
              </Link>
            </div>

            {/* Submit Button */}
            <AnimatedButton
              type="submit"
              variant="gradient"
              size="lg"
              isLoading={isLoading}
              fullWidth
              magnetic
            >
              <LogIn size={18} />
              {t('auth.login')}
            </AnimatedButton>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm mb-3">
                {t('auth.noAccount')}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm transition-all hover:gap-3"
              >
                {t('auth.register')}
                <span className="transition-transform">→</span>
              </Link>
            </div>
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
                      ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' 
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

      {/* Version badge */}
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-600">
        v1.0.0
      </div>
    </div>
  );
};

// Featured gradient card component
const FeaturedGradientCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative group">
    {/* Animated gradient border */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-gradient-shift bg-[length:200%_auto]" />
    
    {/* Inner card */}
    <div className="relative bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      {children}
    </div>
  </div>
);

// Add shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }
`;
document.head.appendChild(style);

export default LoginPage;
