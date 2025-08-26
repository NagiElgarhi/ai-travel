import React, { useState } from 'react';
import type { ItineraryFormData } from '../App';
import { useTranslation } from '../hooks/useTranslation';
import type { Attraction } from '../types';
import AttractionSelector from './AttractionSelector';

interface ItineraryFormProps {
  onSubmit: (data: ItineraryFormData) => void;
  isLoading: boolean;
  onFetchAttractions: (destination: string) => void;
  attractions: Attraction[];
  isFetchingAttractions: boolean;
  attractionError: string | null;
}

type InputFieldProps = {
  label: string;
  name: string;
  helpText?: string;
} & (
  | { isTextArea?: false } & React.InputHTMLAttributes<HTMLInputElement>
  | { isTextArea: true } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
);

const InputField: React.FC<InputFieldProps> = ({ label, name, helpText, isTextArea, ...props }) => {
  const commonClasses = "w-full px-4 py-2.5 bg-zinc-100/50 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white transition duration-200 shadow-sm";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      {isTextArea ? (
        <textarea id={name} name={name} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} className={commonClasses} />
      ) : (
        <input id={name} name={name} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} className={commonClasses} />
      )}
      {helpText && <p className="text-xs text-zinc-500 mt-1.5">{helpText}</p>}
    </div>
  );
}

const RadioGroup: React.FC<{ legend: string; name: string; options: string[]; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; t: (key: string) => string; t_prefix: string;}> = ({ legend, name, options, value, onChange, t, t_prefix }) => (
    <fieldset>
        <legend className="block text-sm font-medium text-zinc-700 mb-2">{legend}</legend>
        <div className="flex flex-wrap gap-2">
            {options.map(level => (
                <div key={level}>
                    <input
                        type="radio"
                        id={`${name}-${level}`}
                        name={name}
                        value={level}
                        checked={value === level}
                        onChange={onChange}
                        className="sr-only peer"
                    />
                    <label
                        htmlFor={`${name}-${level}`}
                        className="px-3 py-1.5 border border-zinc-300 rounded-full text-sm text-zinc-600 cursor-pointer transition-colors duration-200 peer-checked:bg-primary-600 peer-checked:text-white peer-checked:border-primary-600 hover:bg-zinc-200/60 peer-checked:hover:bg-primary-700"
                    >
                        {t(`${t_prefix}${level.replace('-', '')}` as any)}
                    </label>
                </div>
            ))}
        </div>
    </fieldset>
);


const ItineraryForm: React.FC<ItineraryFormProps> = ({
  onSubmit,
  isLoading,
  onFetchAttractions,
  attractions,
  isFetchingAttractions,
  attractionError,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ItineraryFormData>({
    destination: '',
    duration: '',
    interests: '',
    activityLevel: 'Moderate',
    tripStyle: 'Solo',
    budget: 'Mid-range',
    origin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttractionToggle = (attractionName: string) => {
    const currentInterests = new Set(
      formData.interests.split(',').map(s => s.trim()).filter(Boolean)
    );
    if (currentInterests.has(attractionName)) {
      currentInterests.delete(attractionName);
    } else {
      currentInterests.add(attractionName);
    }
    setFormData(prev => ({ ...prev, interests: Array.from(currentInterests).join(', ') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination || !formData.duration || !formData.interests) {
      alert(t('formValidationAlert'));
      return;
    }
    onSubmit(formData);
  };
  
  const selectedAttractions = new Set(formData.interests.split(',').map(s => s.trim()).filter(Boolean));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 relative">
            <InputField
              label={t('destinationLabel')} type="text" name="destination"
              value={formData.destination} onChange={handleChange}
              placeholder={t('destinationPlaceholder')} required
            />
            <button
              type="button"
              onClick={() => onFetchAttractions(formData.destination)}
              disabled={!formData.destination || isFetchingAttractions}
              className="absolute top-[34px] right-2.5 bg-secondary-500 text-white font-semibold text-xs px-3 py-1.5 rounded-md hover:bg-secondary-600 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
            >
              {isFetchingAttractions ? t('fetchingAttractions') : t('findAttractionsButton')}
            </button>
          </div>
          <div>
             <InputField
              label={t('durationLabel')} type="number" name="duration"
              value={formData.duration} onChange={handleChange}
              placeholder={t('durationPlaceholder')} min="1" required
            />
          </div>
        </div>
        <div>
           <InputField
              label={t('departureCityLabel')} type="text" name="origin"
              value={formData.origin} onChange={handleChange}
              placeholder={t('departureCityPlaceholder')}
              helpText={t('departureCityHelp')}
            />
        </div>
        <div>
          <InputField
            isTextArea
            label={t('interestsLabel')} name="interests"
            value={formData.interests} onChange={handleChange}
            placeholder={t('interestsPlaceholder')} rows={3} required
          />
        </div>
        
        {attractionError && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-lg">{attractionError}</p>}
        
        {attractions.length > 0 && (
          <AttractionSelector
            attractions={attractions}
            selectedAttractions={selectedAttractions}
            onAttractionToggle={handleAttractionToggle}
            destination={formData.destination}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-zinc-200 pt-8">
        <RadioGroup
          legend={t('activityLevelLabel')}
          name="activityLevel"
          options={['Relaxed', 'Moderate', 'Packed']}
          value={formData.activityLevel}
          onChange={handleChange}
          t={t}
          t_prefix="activityLevel"
        />
        <RadioGroup
          legend={t('budgetLabel')}
          name="budget"
          options={['Budget', 'Mid-range', 'Luxury']}
          value={formData.budget}
          onChange={handleChange}
          t={t}
          t_prefix="budget"
        />
        <div>
          <label htmlFor="tripStyle" className="block text-sm font-medium text-zinc-700 mb-2">
            {t('tripStyleLabel')}
          </label>
          <select
            id="tripStyle"
            name="tripStyle"
            value={formData.tripStyle}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border bg-zinc-100/50 border-zinc-300 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition duration-200 shadow-sm"
          >
            <option value="Solo">{t('tripStyleSolo')}</option>
            <option value="Couple">{t('tripStyleCouple')}</option>
            <option value="Family">{t('tripStyleFamily')}</option>
            <option value="Friends">{t('tripStyleFriends')}</option>
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-gradient-to-r from-secondary-500 to-primary-600 text-white font-semibold px-6 py-3.5 rounded-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:bg-zinc-400 disabled:from-zinc-400 disabled:to-zinc-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('generatingButton')}
            </>
          ) : (
            t('generateButton')
          )}
        </button>
      </div>
    </form>
  );
};

export default ItineraryForm;