import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <div className="glass px-4 py-2 rounded-full">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                i18n.language === 'en' ? 'bg-primary-500 text-white' : 'text-glass-text hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('ar')}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                i18n.language === 'ar' ? 'bg-primary-500 text-white' : 'text-glass-text hover:text-white'
              }`}
            >
              AR
            </button>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Soaal</h1>
            <p className="text-glass-textSecondary">RAG Dashboard</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
