import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PaperPlaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M21.62 2.99024C21.32 2.70024 20.93 2.56024 20.54 2.61024L3.54 4.88024C2.68 4.99024 2.11 5.94024 2.52 6.74024L5.16 11.4102L9.43 12.5502L16.5 6.51024L11.23 13.5702L12.42 18.0602C12.63 18.8902 13.56 19.2902 14.28 18.8602L16.89 17.2002L19.2 19.3402C19.61 19.7102 20.27 19.6702 20.63 19.2602L21.94 17.7802C22.61 17.0302 22.47 15.8202 21.61 15.1902L12.62 7.70024L18.8 10.3702L21.72 4.19024C21.94 3.73024 21.85 3.20024 21.62 2.99024Z" 
    className="fill-primary-600" />
  </svg>
);


const LoadingSpinner: React.FC = () => {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const loadingMessages = React.useMemo(() => [
    t('loadingMessage1'),
    t('loadingMessage2'),
    t('loadingMessage3'),
    t('loadingMessage4'),
    t('loadingMessage5'),
    t('loadingMessage6'),
    t('loadingMessage7'),
  ], [t]);

  useEffect(() => {
    setCurrentMessage(loadingMessages[0]);
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, [loadingMessages]);

  useEffect(() => {
    setCurrentMessage(loadingMessages[messageIndex]);
  }, [messageIndex, loadingMessages]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center animate-fade-in-up" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)'}}>
      <PaperPlaneIcon className="h-12 w-12 animate-spin-plane mb-6" />
      <h3 className="text-xl font-semibold text-zinc-100">{t('loadingTitle')}</h3>
      <p key={currentMessage} className="text-zinc-200 mt-1 min-h-[24px] animate-fade-in-up">
        {currentMessage}
      </p>
    </div>
  );
};

export default LoadingSpinner;