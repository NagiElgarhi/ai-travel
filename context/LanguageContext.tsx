import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

export type Locale = 'en' | 'ar';
type Translations = Record<string, string>;
type AllTranslations = Record<Locale, Translations>;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translations: Translations;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Check for saved preference, otherwise default to 'en'
    const savedLocale = localStorage.getItem('locale');
    return (savedLocale === 'ar' || savedLocale === 'en') ? savedLocale : 'en';
  });

  const [allTranslations, setAllTranslations] = useState<AllTranslations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Use fetch, which is universally supported, instead of import assertions
        const [enResponse, arResponse] = await Promise.all([
          fetch('./i18n/en.json'),
          fetch('./i18n/ar.json'),
        ]);

        if (!enResponse.ok || !arResponse.ok) {
          throw new Error(`Failed to fetch translation files: ${enResponse.statusText}, ${arResponse.statusText}`);
        }

        const enData = await enResponse.json();
        const arData = await arResponse.json();
        setAllTranslations({ en: enData, ar: arData });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Failed to load translation files:", errorMessage);
        setError("Could not load language files. Please refresh the page.");
      }
    };

    fetchTranslations();
  }, []);


  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  }, []);

  useEffect(() => {
    if (allTranslations) {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }
  }, [locale, allTranslations]);

  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    translations: allTranslations ? allTranslations[locale] : {},
  }), [locale, setLocale, allTranslations]);

  if (error) {
    return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif', color: 'red' }}>{error}</div>;
  }
  
  // Prevent rendering the app until translations are loaded to avoid a flash of untranslated content
  if (!allTranslations) {
    return null; // The page will be blank for a moment while translations load
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};