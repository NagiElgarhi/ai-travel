import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ItineraryForm from './components/ItineraryForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import Footer from './components/Footer';
import ApiKeyModal from './components/ApiKeyModal';
import { generateItinerary, fetchAttractions } from './services/geminiService';
import type { ItineraryData, Attraction } from './types';
import { useTranslation } from './hooks/useTranslation';

const ITINERARIES_STORAGE_KEY = 'ai-travel-planner-itineraries';
const API_KEY_STORAGE_KEY = 'gemini-api-key';

export interface ItineraryFormData {
  destination: string;
  duration: string;
  interests: string;
  activityLevel: string;
  tripStyle: string;
  budget: string;
  origin: string;
}

const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 11);
};

// Helper to check if we can safely manipulate the browser history.
// This prevents crashes in sandboxed environments (like blob: URLs).
const canManipulateHistory = () => {
    try {
        return window.location.protocol !== 'blob:';
    } catch (e) {
        return false;
    }
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, locale } = useTranslation();
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isFetchingAttractions, setIsFetchingAttractions] = useState(false);
  const [attractionError, setAttractionError] = useState<string | null>(null);


  useEffect(() => {
    // Load API Key from local storage on initial render
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }

    // Load itinerary from URL if present
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const itineraryId = urlParams.get('itineraryId');

      if (itineraryId) {
        const savedItinerariesRaw = localStorage.getItem(ITINERARIES_STORAGE_KEY);
        if (savedItinerariesRaw) {
          const savedItineraries = JSON.parse(savedItinerariesRaw);
          const loadedItinerary = savedItineraries[itineraryId];
          if (loadedItinerary) {
            setItinerary(loadedItinerary);
          } else {
            setError(t('itineraryNotFoundError'));
             if (canManipulateHistory()) {
                window.history.replaceState({}, '', window.location.pathname);
             }
          }
        } else {
            setError(t('itineraryNoSavedPlans'));
            if (canManipulateHistory()) {
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
      }
    } catch (e) {
      console.error("Failed to load saved itinerary from URL:", e);
      setError(t('itineraryLoadError'));
    }
  }, [t]);
  
  const handleSaveApiKey = useCallback((key: string) => {
    if (key) {
      setApiKey(key);
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setIsApiKeyModalOpen(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    }
  }, [pendingAction]);

  const withApiKeyCheck = useCallback((action: () => void) => {
    if (!apiKey) {
      setPendingAction(() => action);
      setIsApiKeyModalOpen(true);
    } else {
      action();
    }
  }, [apiKey]);

  const handleApiError = (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      if (errorMessage.includes('authentication')) {
          setError(t('apiKeyModalError'));
          localStorage.removeItem(API_KEY_STORAGE_KEY);
          setApiKey(null);
          setIsApiKeyModalOpen(true);
      } else {
          setError(`Failed to generate itinerary. ${errorMessage}`);
      }
      console.error(err);
  };


  const handleGenerateItinerary = useCallback(async (formData: ItineraryFormData) => {
     withApiKeyCheck(() => {
        const execute = async () => {
            if (!apiKey) return; // Should not happen due to withApiKeyCheck
            setIsLoading(true);
            setError(null);
            setItinerary(null);
            if (canManipulateHistory()) {
                window.history.pushState({}, '', window.location.pathname);
            }

            try {
              const durationNum = parseInt(formData.duration, 10);
              if (isNaN(durationNum) || durationNum <= 0) {
                throw new Error("Please enter a valid number of days.");
              }
              const data = await generateItinerary(
                formData.destination,
                durationNum,
                formData.interests,
                formData.activityLevel,
                formData.tripStyle,
                formData.budget,
                formData.origin,
                locale,
                apiKey
              );
              setItinerary(data);
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
            }
        };
        execute();
    });
  }, [locale, apiKey, withApiKeyCheck]);

  const handleFetchAttractions = useCallback(async (destination: string) => {
    withApiKeyCheck(() => {
        const execute = async () => {
            if (!apiKey) return; // Should not happen due to withApiKeyCheck
            if (!destination) return;
            setIsFetchingAttractions(true);
            setAttractionError(null);
            setAttractions([]);
            try {
              const result = await fetchAttractions(destination, locale, apiKey);
              setAttractions(result);
            } catch (err) {
              setAttractionError(t('attractionsError'));
              console.error(err);
            } finally {
              setIsFetchingAttractions(false);
            }
        };
        execute();
    });
  }, [apiKey, locale, t, withApiKeyCheck]);

  const handleSaveItinerary = useCallback(() => {
    if (itinerary) {
      try {
        const savedItinerariesRaw = localStorage.getItem(ITINERARIES_STORAGE_KEY);
        const allItineraries = savedItinerariesRaw ? JSON.parse(savedItinerariesRaw) : {};
        
        const idToSave = itinerary.id || generateUniqueId();
        const itineraryToSave = { ...itinerary, id: idToSave };

        allItineraries[idToSave] = itineraryToSave;

        localStorage.setItem(ITINERARIES_STORAGE_KEY, JSON.stringify(allItineraries));
        
        setItinerary(itineraryToSave);
        
        if (canManipulateHistory()) {
            const newUrl = `${window.location.pathname}?itineraryId=${idToSave}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
        }

        alert(t('itinerarySaveSuccess'));
      } catch (e) {
        console.error("Failed to save itinerary:", e);
        setError(t('itinerarySaveError'));
      }
    }
  }, [itinerary, t]);
  
  const handleNewItinerary = useCallback(() => {
    setItinerary(null);
    setError(null);
    if (canManipulateHistory()) {
        window.history.pushState({}, '', window.location.pathname);
    }
    document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' });
  }, []);


  return (
    <div className="min-h-screen font-sans text-zinc-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-16">
        {!itinerary && (
            <>
                <Hero />
                <section id="planner" className="mt-12 md:mt-16 bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-black/20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <ItineraryForm
                      onSubmit={handleGenerateItinerary}
                      isLoading={isLoading}
                      onFetchAttractions={handleFetchAttractions}
                      attractions={attractions}
                      isFetchingAttractions={isFetchingAttractions}
                      attractionError={attractionError}
                    />
                </section>
            </>
        )}

        <section id="itinerary" className="mt-12 md:mt-16">
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="text-center p-6 bg-red-100 text-red-700 rounded-lg animate-fade-in-up">
              <p className="font-semibold">{t('errorTitle')}</p>
              <p>{error}</p>
               <button
                  onClick={handleNewItinerary}
                  className="mt-4 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('errorCreateNewPlan')}
                </button>
            </div>
          )}
          {itinerary && !isLoading && (
            <ItineraryDisplay 
              data={itinerary} 
              onSave={handleSaveItinerary}
              onNew={handleNewItinerary}
            />
          )}
        </section>
      </main>
      <Footer />
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => {
            setIsApiKeyModalOpen(false);
            setPendingAction(null);
        }}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default App;