import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="text-center">
      <h1 
        className="font-serif text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-600 pb-3 animate-fade-in-up"
      >
        {t('heroTitle')}
      </h1>
      <p 
        className="mt-4 text-lg text-zinc-100 max-w-2xl mx-auto animate-fade-in-up"
        style={{ animationDelay: '100ms', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {t('heroSubtitle')}
      </p>
    </section>
  );
};

export default Hero;