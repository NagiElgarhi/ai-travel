import React, { useState } from 'react';
import type { ItineraryData, DailyPlan, Activity, SuggestedCompany } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { InfoIcon } from './icons/InfoIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { MapPinIcon } from './icons/MapPinIcon';
import { ShareIcon } from './icons/ShareIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { ChecklistIcon } from './icons/ChecklistIcon';
import { PrintIcon } from './icons/PrintIcon';
import { NewPlanIcon } from './icons/NewPlanIcon';
import { SaveIcon } from './icons/SaveIcon';
import { useTranslation } from '../hooks/useTranslation';

interface ItineraryDisplayProps {
  data: ItineraryData;
  onSave: () => void;
  onNew: () => void;
}

const ActivityDetail: React.FC<{ icon: React.ReactNode; text: string; link?: string; ariaLabel?: string; }> = ({ icon, text, link, ariaLabel }) => {
  const content = (
    <div className="flex items-center space-x-2 bg-zinc-200/70 text-zinc-700 rounded-full px-3 py-1 text-xs">
      <div className="flex-shrink-0 w-4 h-4 text-zinc-500">{icon}</div>
      <p>{text}</p>
    </div>
  );

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:bg-zinc-300/80 transition-colors rounded-full"
        aria-label={ariaLabel || text}
      >
        {content}
      </a>
    );
  }
  return content;
};

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const { t } = useTranslation();
    return (
      <li className="relative pl-10">
          <div className="absolute left-0 top-0 h-full border-l-2 border-zinc-200"></div>
          <div className="absolute left-[-9px] top-1.5 h-4 w-4 rounded-full bg-white border-2 border-primary-600"></div>
          <div className="mb-1">
            <p className="font-semibold text-primary-800">{activity.time}</p>
          </div>
          <p className="font-medium text-zinc-800">{activity.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {activity.tip && <ActivityDetail icon={<InfoIcon />} text={activity.tip} />}
            {activity.estimatedCost && <ActivityDetail icon={<DollarSignIcon />} text={`${t('costLabel')}: ${activity.estimatedCost}`} />}
            {activity.latitude && activity.longitude && (
              <ActivityDetail
                icon={<MapPinIcon />}
                text={t('viewOnMap')}
                link={`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`}
                ariaLabel={`View location for ${activity.description} on Google Maps`}
              />
            )}
          </div>
      </li>
    );
};


const DailyPlanCard: React.FC<{ plan: DailyPlan, style?: React.CSSProperties }> = ({ plan, style }) => {
    const { t } = useTranslation();
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/15 transition-shadow hover:shadow-xl printable-card animate-fade-in-up" style={style}>
        <div className="flex items-start space-x-4 mb-6">
           <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex flex-col items-center justify-center font-bold text-sm shadow-lg">
                <span>{t('dayLabel')}</span>
                <span className="text-xl">{plan.day}</span>
            </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-zinc-800">{plan.title}</h3>
            <p className="text-sm text-zinc-500">{plan.description}</p>
          </div>
        </div>
        <ul className="space-y-6">
          {plan.activities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} />
          ))}
        </ul>
      </div>
    );
};

const SuggestedCompanyCard: React.FC<{ company: SuggestedCompany, style?: React.CSSProperties }> = ({ company, style }) => {
    const { t } = useTranslation();
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/15 transition-shadow hover:shadow-xl flex flex-col no-print animate-fade-in-up" style={style}>
            <div className="flex items-center space-x-3 mb-3">
                <div className="flex-shrink-0 bg-secondary-100 text-secondary-700 p-2 rounded-lg">
                    <BriefcaseIcon className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-bold text-zinc-800">{company.name}</h4>
            </div>
            <p className="text-sm text-zinc-600 flex-grow">{company.description}</p>
            <a 
                href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-primary-600 hover:text-primary-700 self-start group"
            >
                {t('visitWebsite')} <span className="transition-transform duration-200 group-hover:translate-x-1 inline-block">&rarr;</span>
            </a>
        </div>
    );
};

const ActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; text: string; className: string; }> = ({ onClick, icon, text, className }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg ${className}`}
    >
        {icon}
        <span>{text}</span>
    </button>
);

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ data, onSave, onNew }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (!data.id) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?itineraryId=${data.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500); // Reset after 2.5 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy link.');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="text-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <h2 className="font-serif text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-600 pb-3">
          {data.tripTitle}
        </h2>
      </div>

      <div className="no-print bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-xl shadow-black/20 flex flex-wrap items-center justify-center gap-3 sticky top-20 z-10">
        <ActionButton onClick={onSave} icon={<SaveIcon className="w-5 h-5"/>} text={t('savePlanButton')} className="bg-accent-500 text-white hover:bg-accent-600" />
        {data.id && (
           <ActionButton onClick={handleShare} icon={<ShareIcon className="w-5 h-5" />} text={isCopied ? t('copiedButton') : t('shareLinkButton')} className="bg-secondary-600 text-white hover:bg-secondary-700 w-36" />
        )}
        <ActionButton onClick={handlePrint} icon={<PrintIcon className="w-5 h-5" />} text={t('printPlanButton')} className="bg-primary-600 text-white hover:bg-primary-700" />
        <ActionButton onClick={onNew} icon={<NewPlanIcon className="w-5 h-5"/>} text={t('newPlanButton')} className="bg-zinc-600 text-white hover:bg-zinc-700" />
      </div>

      {data.tripRequirements && data.tripRequirements.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-lg shadow-black/15 no-print animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 bg-primary-100 text-primary-700 p-2 rounded-lg">
                    <ChecklistIcon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-zinc-800">{t('checklistTitle')}</h3>
            </div>
            <ul className="space-y-2 list-inside grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {data.tripRequirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-accent-500 mr-2 mt-1">&#10003;</span>
                        <span className="text-zinc-700">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <div className="space-y-8">
        {data.itinerary.map((plan, index) => (
          <DailyPlanCard key={plan.day} plan={plan} style={{ animationDelay: `${200 + index * 150}ms` }}/>
        ))}
      </div>

      {data.suggestedCompanies && data.suggestedCompanies.length > 0 && (
        <div className="mt-12 no-print">
            <h3 className="font-serif text-2xl font-bold text-zinc-100 text-center mb-6 animate-fade-in-up" style={{ animationDelay: `${200 + data.itinerary.length * 150}ms`, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{t('suggestedCompaniesTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.suggestedCompanies.map((company, index) => (
                    <SuggestedCompanyCard key={index} company={company} style={{ animationDelay: `${250 + (data.itinerary.length + index) * 150}ms` }}/>
                ))}
            </div>
        </div>
      )}

    </div>
  );
};

export default ItineraryDisplay;