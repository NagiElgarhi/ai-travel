import { useContext } from 'react';
import { LanguageContext, Locale } from '../context/LanguageContext';

type TranslationKey = string;

interface UseTranslationResult {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const useTranslation = (): UseTranslationResult => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { locale, setLocale, translations } = context;

  const t = (key: TranslationKey): string => {
    return translations[key] || key;
  };

  return { locale, setLocale, t };
};
