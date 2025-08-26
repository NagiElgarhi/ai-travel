import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (!isOpen) {
      setApiKey('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in-up"
      style={{ animationDuration: '0.3s' }}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md m-4 relative transform transition-all" >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="space-y-4 text-center">
            <h2 className="text-2xl font-bold font-serif text-zinc-800">{t('apiKeyModalTitle')}</h2>
            <p className="text-zinc-600 text-sm">
                {t('apiKeyModalDescription')}
            </p>
             <a 
                href="https://aistudio.google.com/app/apikey"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-700 group"
            >
                {t('apiKeyModalGetYourKey')} <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
            </a>
        </div>

        <div className="mt-6 space-y-2">
           <label htmlFor="apiKey" className="block text-sm font-medium text-zinc-700">
            {t('apiKeyModalInputLabel')}
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('apiKeyModalPlaceholder')}
            className="w-full px-4 py-2.5 bg-zinc-100/50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition duration-200 shadow-sm"
          />
        </div>

        <div className="mt-8">
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="w-full flex justify-center items-center bg-gradient-to-r from-secondary-500 to-primary-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
          >
            {t('apiKeyModalSaveButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
