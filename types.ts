export interface Activity {
  time: string;
  description: string;
  icon: string; // Emoji
  tip?: string;
  estimatedCost?: string;
  latitude?: number;
  longitude?: number;
}

export interface DailyPlan {
  day: number;
  title: string;
  description: string;
  activities: Activity[];
}

export interface SuggestedCompany {
  name: string;
  description: string;
  website: string;
}

export interface ItineraryData {
  id?: string;
  tripTitle: string;
  itinerary: DailyPlan[];
  suggestedCompanies?: SuggestedCompany[];
  tripRequirements?: string[];
}

export interface Attraction {
  name: string;
  description: string;
  category: string;
}
