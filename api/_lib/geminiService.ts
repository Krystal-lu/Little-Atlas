import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables if present
dotenv.config();

export interface PlanTripInput {
  destination: string;
  daysCount: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  interests: string[];
  budget: 'budget' | 'moderate' | 'premium';
  additionalPreferences?: string;
}

export interface DayItineraryData {
  dayNumber: number;
  neighborhoodOrArea: string;
  theme?: string;
  morning: string;
  lunch: string;
  afternoon: string;
  evening: string;
  notes?: string;
}

export interface TripPlanResult {
  id: string;
  destination: string;
  daysCount: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  interests: string[];
  budget: 'budget' | 'moderate' | 'premium';
  additionalPreferences?: string;
  overview?: string;
  days: DayItineraryData[];
  createdAt: string;
}

export interface ReviseTripInput {
  currentPlan: TripPlanResult;
  revisionPrompt: string;
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    const err = new Error('Trip planning is temporarily unavailable.');
    (err as any).code = 'NO_API_KEY';
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    destination: {
      type: Type.STRING,
      description: 'The destination name, e.g. Tokyo, Japan',
    },
    overview: {
      type: Type.STRING,
      description: 'A 1-2 sentence calm, evocative summary of the trip atmosphere.',
    },
    days: {
      type: Type.ARRAY,
      description: 'The day-by-day travel plan.',
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: {
            type: Type.INTEGER,
            description: 'Sequential day number starting at 1',
          },
          neighborhoodOrArea: {
            type: Type.STRING,
            description: 'Primary area, neighborhood or quarter visited (e.g. Daikanyama & Nakameguro)',
          },
          theme: {
            type: Type.STRING,
            description: 'Short atmospheric theme for the day, e.g. Quiet canals & local design',
          },
          morning: {
            type: Type.STRING,
            description: 'Morning walk, exploration, or cafe stop',
          },
          lunch: {
            type: Type.STRING,
            description: 'Lunch recommendation or regional specialty',
          },
          afternoon: {
            type: Type.STRING,
            description: 'Afternoon wandering, shops, or cultural visits',
          },
          evening: {
            type: Type.STRING,
            description: 'Dinner, twilight stroll, or relaxing night spot',
          },
          notes: {
            type: Type.STRING,
            description: 'Subtle neighborhood tip or gentle practical advice',
          },
        },
        required: [
          'dayNumber',
          'neighborhoodOrArea',
          'morning',
          'lunch',
          'afternoon',
          'evening',
        ],
      },
    },
  },
  required: ['destination', 'days'],
};

const SYSTEM_INSTRUCTION = `You are a thoughtful, nostalgic travel journal curator for Little Atlas.
Your role is to craft practical, charming, and unhurried daily itineraries based purely on the traveler's destination, days, travel pace, interests, budget, and specific preferences.

CRITICAL INSTRUCTIONS & BOUNDARIES:
1. Pacing:
   - "relaxed": 1-2 leisurely highlights per half-day with plenty of open time, neighborhood wandering, and calm pauses.
   - "balanced": 2-3 activities per half-day, engaging yet comfortable and humane.
   - "packed": 3-4 activities per half-day, maximizing stops while maintaining strict geographic walkability.
2. Structure:
   - Group each day's stops within 1 or 2 adjacent, connected neighborhoods so travel time is brief and pleasurable.
   - Avoid frantic cross-city zig-zagging.
3. NO FALSE LIVE CLAIMS:
   - Never claim live opening hours, exact admission prices, live seat availability, or "best rated right now".
   - When mentioning specific restaurants, cafes, bookstores, or venues, use soft, gentle wording:
     "Consider stopping by...", "A possible option to seek out...", "Worth checking for lunch...", "You might enjoy a quiet stroll around...".
4. Tone & Style:
   - Warm, evocative, personal, and poetic yet entirely realistic. Like notes handwritten into a personal clothbound travel journal.
   - Do NOT use generic marketing hype or corporate buzzwords.`;

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
];

async function callWithFallback(
  ai: GoogleGenAI,
  prompt: string,
  config: any
): Promise<any> {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next fallback...`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('All candidate models failed.');
}

export async function generateTripPlan(input: PlanTripInput): Promise<TripPlanResult> {
  const ai = getAiClient();

  const daysCount = Math.min(Math.max(Number(input.daysCount) || 3, 1), 14);
  const prompt = `Please craft a ${daysCount}-day travel itinerary for "${input.destination}".

Traveler's parameters:
- Destination: ${input.destination}
- Number of days: ${daysCount}
- Travel pace: ${input.pace}
- Selected interests: ${input.interests.length > 0 ? input.interests.join(', ') : 'General local discovery'}
- Budget style: ${input.budget}
${input.additionalPreferences?.trim() ? `- Personal wishes & notes: ${input.additionalPreferences.trim()}` : ''}

Create exactly ${daysCount} days in the itinerary. Group each day around a specific district or neighborhood.`;

  const text = await callWithFallback(ai, prompt, {
    systemInstruction: SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: itineraryResponseSchema,
  });

  const parsed = JSON.parse(text);
  const plan: TripPlanResult = {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    destination: parsed.destination || input.destination,
    daysCount,
    pace: input.pace,
    interests: input.interests,
    budget: input.budget,
    additionalPreferences: input.additionalPreferences,
    overview: parsed.overview || `A ${input.pace} ${daysCount}-day journey exploring ${input.destination}.`,
    days: Array.isArray(parsed.days) ? parsed.days : [],
    createdAt: new Date().toISOString(),
  };

  return plan;
}

export async function reviseTripPlan(input: ReviseTripInput): Promise<TripPlanResult> {
  const ai = getAiClient();
  const { currentPlan, revisionPrompt } = input;

  const prompt = `The traveler wishes to adjust their existing itinerary for "${currentPlan.destination}".

Current Itinerary:
${JSON.stringify(currentPlan, null, 2)}

Traveler's requested adjustment:
"${revisionPrompt}"

REVISION RULES:
1. Maintain the destination ("${currentPlan.destination}").
2. Keep the same number of days (${currentPlan.days.length}) unless the traveler explicitly asked to change the number of days.
3. PRESERVE unaffected days and stops completely or with minimal adjustment.
4. Update only what the traveler explicitly asked to modify (e.g. if they say "Day 2 is too busy. Make it more relaxed", only simplify Day 2 and leave the other days intact).
5. Maintain the selected pace (${currentPlan.pace}) and budget (${currentPlan.budget}).
6. Keep language soft (e.g., "Consider", "Possible option", "Worth checking").
7. Output the full updated itinerary in the exact same structured JSON schema.`;

  const text = await callWithFallback(ai, prompt, {
    systemInstruction: SYSTEM_INSTRUCTION,
    responseMimeType: 'application/json',
    responseSchema: itineraryResponseSchema,
  });

  const parsed = JSON.parse(text);
  const updatedPlan: TripPlanResult = {
    ...currentPlan,
    destination: parsed.destination || currentPlan.destination,
    overview: parsed.overview || currentPlan.overview,
    days: Array.isArray(parsed.days) ? parsed.days : currentPlan.days,
    daysCount: Array.isArray(parsed.days) ? parsed.days.length : currentPlan.daysCount,
  };

  return updatedPlan;
}
