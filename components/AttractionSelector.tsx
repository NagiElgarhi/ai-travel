import React from 'react';
import type { Attraction } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface AttractionSelectorProps {
  attractions: Attraction[];
  selectedAttractions: Set<string>;
  onAttractionToggle: (attractionName: string) => void;
  destination: string;
}

const AttractionSelector: React.FC<AttractionSelectorProps> = ({ attractions, selectedAttractions, onAttractionToggle, destination }) => {
  const { t } = useTranslation();

  const groupedAttractions = attractions.reduce((acc, attraction) => {
    const category = attraction.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(attraction);
    return acc;
  }, {} as Record<string, Attraction[]>);
  
  const categoryOrder = ["Landmarks & Monuments", "Museums & Galleries", "Nature & Parks", "Shopping & Markets", "Entertainment"];
  const sortedCategories = Object.keys(groupedAttractions).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <div className="space-y-6 bg-zinc-200/30 p-4 rounded-lg border border-zinc-300/50 animate-fade-in-up">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-zinc-800">
            {t('attractionsSectionTitle').replace('{destination}', destination)}
        </h3>
        <p className="text-sm text-zinc-500">{t('attractionsHelperText')}</p>
      </div>
      <div className="space-y-4">
        {sortedCategories.map(category => (
          <div key={category}>
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary-700 mb-2 border-b-2 border-primary-100 pb-1">
              {t(`category${category}` as any) || category}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {groupedAttractions[category].map(attraction => (
                <label
                  key={attraction.name}
                  className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
                    selectedAttractions.has(attraction.name)
                      ? 'bg-primary-50 border-primary-400 shadow-sm'
                      : 'bg-white border-transparent hover:bg-zinc-200/60 hover:border-zinc-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAttractions.has(attraction.name)}
                    onChange={() => onAttractionToggle(attraction.name)}
                    className="mt-1 h-4 w-4 rounded border-zinc-400 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-800">{attraction.name}</p>
                    <p className="text-xs text-zinc-500">{attraction.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttractionSelector;