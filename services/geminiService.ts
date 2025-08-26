import { GoogleGenAI, Type } from "@google/genai";
import type { ItineraryData, Attraction } from '../types';

export const generateItinerary = async (
  destination: string,
  duration: number,
  interests: string,
  activityLevel: string,
  tripStyle: string,
  budget: string,
  origin: string | undefined,
  locale: 'en' | 'ar',
  apiKey: string,
): Promise<ItineraryData> => {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const languageInstruction = locale === 'ar' 
        ? 'The entire JSON response, including all titles, descriptions, tips, and company details, MUST be in Arabic.'
        : 'The entire JSON response, including all titles, descriptions, tips, and company details, MUST be in English.';

    const prompt = `
      You are an expert travel planner. Create a detailed, practical, and engaging travel itinerary.

      **Primary Language for Response:** ${languageInstruction}

      **Trip Details:**
      - Destination: ${destination}
      - Duration: ${duration} days
      - Interests: ${interests}
      - Trip Style: ${tripStyle}
      - Budget: ${budget}
      - Activity Level: ${activityLevel}
      ${origin ? `- Origin: ${origin}` : ''}

      **Instructions:**
      1.  **Generate a day-by-day itinerary.** For each activity, you MUST provide:
          - A suggested time (e.g., '9:00 AM' or 'Afternoon').
          - A detailed description.
          - A single, relevant emoji icon.
          - An optional "tip" with useful advice.
          - An optional "estimatedCost" (e.g., "$20", "Free").
          - The precise numerical "latitude" and "longitude" for the location.

      2.  **Find REAL travel companies.** Use your search tool to find exactly 3 **real** travel agencies or tour operators that are a good fit for this specific trip (destination, budget, style). For each company, provide its actual name, a short description of what makes it a good fit, and its **real, official website URL**. Do not invent companies.

      3.  **Create a Trip Preparation Checklist.** ${origin ? `Because the user is traveling from ${origin}, create a "tripRequirements" list. This should be an array of short, actionable strings covering essential pre-travel tasks like visa checks, currency exchange, packing advice for the destination's climate, and flight booking reminders.` : 'If no origin is provided, create a generic "tripRequirements" list with reminders to book flights and accommodation.'}
      
      4.  **Format the entire output as a single, valid JSON object.** Do not include any text or markdown formatting before or after the JSON. The JSON object must have the following structure:
          {
            "tripTitle": "A creative and catchy title for the trip.",
            "tripRequirements": [
              "Actionable tip 1 (e.g., Check visa requirements for your nationality).",
              "Actionable tip 2 (e.g., Book flights from origin to destination)."
            ],
            "itinerary": [
              {
                "day": 1,
                "title": "A short, engaging title for the day's plan.",
                "description": "A brief, one-sentence summary of the day's theme.",
                "activities": [
                  {
                    "time": "string",
                    "description": "string",
                    "icon": "emoji",
                    "tip": "string (optional)",
                    "estimatedCost": "string (optional)",
                    "latitude": number (optional),
                    "longitude": number (optional)
                  }
                ]
              }
            ],
            "suggestedCompanies": [
              {
                "name": "Real Company Name",
                "description": "A brief description of the company.",
                "website": "https://www.realcompanywebsite.com"
              }
            ]
          }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const responseText = response.text?.trim();
    
    if (!responseText) {
      console.error("API returned an empty response.", response);
      throw new Error("The AI returned an empty response. This might be due to a content filter or an issue with the request.");
    }
    
    let jsonString = responseText;

    // The model might wrap the JSON in markdown, so we need to extract the raw JSON string.
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = jsonString.match(jsonRegex);

    if (match && match[1]) {
        jsonString = match[1];
    } else {
        // Fallback for cases where the JSON is just embedded in other text without markdown fences.
        const startIndex = jsonString.indexOf('{');
        const endIndex = jsonString.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }
    }

    try {
        const parsedData = JSON.parse(jsonString);
        return parsedData as ItineraryData;
    } catch (e) {
        console.error("Failed to parse JSON response from AI. Cleaned string:", jsonString, e);
        console.error("Original AI response:", responseText);
        throw new Error("The AI returned data in an unexpected format. Could not parse the itinerary.");
    }

  } catch (error) {
    console.error("Error generating itinerary:", error);

    // Let our specific, user-friendly errors through.
    if (error instanceof Error && error.message.startsWith('The AI returned')) {
        throw error;
    }
    
    if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission') || error.message.includes('authentication'))) {
        throw new Error("There was an authentication issue with the AI service. Please check your API key.");
    }

    // Generic fallback error
    throw new Error("Failed to generate the itinerary due to a network or server issue. Please check your connection and try again.");
  }
};


export const fetchAttractions = async (
  destination: string,
  locale: 'en' | 'ar',
  apiKey: string,
): Promise<Attraction[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const language = locale === 'ar' ? 'Arabic' : 'English';

    const prompt = `
      You are a travel expert. Provide a list of the top 10-12 tourist attractions for the destination: ${destination}.
      The entire response MUST be in ${language}.
      Categorize each attraction into one of the following exact categories: "Landmarks & Monuments", "Museums & Galleries", "Nature & Parks", "Shopping & Markets", or "Entertainment".
      Provide a brief, one-sentence description for each attraction.
      Return ONLY the JSON array.
    `;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["name", "description", "category"],
          },
        },
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      throw new Error("The AI returned an empty response.");
    }
    
    try {
      const parsedData = JSON.parse(responseText);
      return parsedData as Attraction[];
    } catch (e) {
      console.error("Failed to parse JSON for attractions:", responseText, e);
      throw new Error("The AI returned data in an unexpected format.");
    }

  } catch (error) {
    console.error("Error fetching attractions:", error);
     if (error instanceof Error && (error.message.includes('API key') || error.message.includes('authentication'))) {
        throw new Error("Authentication issue with the AI service. Please check your API key.");
    }
    throw new Error("Failed to fetch attractions due to a network or server issue.");
  }
};