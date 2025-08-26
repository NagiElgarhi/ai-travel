import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-zinc-300">
        <p>&copy; {new Date().getFullYear()} {t('appTitle')}. {t('footerRights')}</p>
        <p className="text-sm mt-1">{t('footerPoweredBy')}</p>
      </div>
    </footer>
  );
};

export default Footer;