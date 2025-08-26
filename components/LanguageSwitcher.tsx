import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import type { Locale } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useTranslation();

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const commonClasses = "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200";
  const activeClasses = "bg-primary-600 text-white shadow-sm";
  const inactiveClasses = "bg-transparent text-zinc-600 hover:bg-zinc-200/70";

  return (
    <div className="flex space-x-1 bg-zinc-200/80 p-1 rounded-lg">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`${commonClasses} ${locale === 'en' ? activeClasses : inactiveClasses}`}
        aria-pressed={locale === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`${commonClasses} ${locale === 'ar' ? activeClasses : inactiveClasses}`}
        aria-pressed={locale === 'ar'}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;