import React from 'react';
import { PlaneIcon } from './icons/PlaneIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

const Header: React.FC = () => {
  const { t } = useTranslation();
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center space-x-3" aria-label="Homepage">
            <PlaneIcon className="w-8 h-8 text-primary-600" />
            <span className="font-serif text-2xl font-bold text-zinc-900">{t('appTitle')}</span>
          </a>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;