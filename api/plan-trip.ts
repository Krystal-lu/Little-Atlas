import { GoogleGenAI, Type } from '@google/genai';

export interface PlanTripInput {
  destination: string;
  daysCount: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  interests: string[];
  budget: 'budget' | 'moderate' | 'premium';
  additionalPreferences?: string;
}

export interface DayItinerary {
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
  overview: string;
  days: DayItinerary[];
}

const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    overview: {
      type: Type.STRING,
      description: 'A 2-3 sentence gentle, evocative introduction to this journey.',
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          neighborhoodOrArea: {
            type: Type.STRING,
            description: 'The specific neighborhood or district for this day.',
          },
          theme: {
            type: Type.STRING,
            description: 'A brief 2-4 word mood or theme, e.g. Old Quarter & canals.',
          },
          morning: {
            type: Type.STRING,
            description: 'Morning exploration or cafe note with gentle suggestion wording.',
          },
          lunch: {
            type: Type.STRING,
            description: 'Lunch idea or culinary note.',
          },
          afternoon: {
            type: Type.STRING,
            description: 'Afternoon wandering, shop, park, or gallery.',
          },
          evening: {
            type: Type.STRING,
            description: 'Evening stroll, dinner, or quiet vista.',
          },
          notes: {
            type: Type.STRING,
            description: 'A quiet practical tip or local custom.',
          },
        },
        required: ['dayNumber', 'neighborhoodOrArea', 'morning', 'lunch', 'afternoon', 'evening'],
      },
    },
  },
  required: ['destination', 'overview', 'days'],
};

const SYSTEM_INSTRUCTION = `You are the thoughtful itinerary curator for "Little Atlas", a quiet, personal travel companion.
Your style guidelines:
1. Focus on coherence and sense of place. Group each day within one or two adjacent walkable neighborhoods so the traveler does not spend all day commuting.
2. Use respectful, gentle language ("Consider", "Possible option", "Worth checking", "You might wander toward").
3. Avoid generic tourist checklist clichés. Include independent bookshops, artisan studios, quiet temple alleys, tucked-away tea houses, river walks, and neighborhood bakeries.
4. Respect traveler pace:
   - Relaxed: 1 primary area, unhurried meals, spacious downtime.
   - Balanced: 2 connected neighborhoods, steady rhythm.
   - Packed: full day from early morning to late evening without being physically impossible.
5. Tone:
   - Warm, evocative, personal, and poetic yet entirely realistic. Like notes handwritten into a personal clothbound travel journal.
   - Never use marketing hype or buzzwords.`;

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
];

async function callWithFallback(ai: GoogleGenAI, prompt: string, config: any): Promise<string> {
  let lastError: any = null;

  // Attempt across candidate models with brief retry for transient 503 high-demand spikes
  for (const model of CANDIDATE_MODELS) {
    const maxRetries = 2;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
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
        lastError = err;
        const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
        
        if (is503 && attempt < maxRetries - 1) {
          // Quick backoff before retrying this model
          await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
          continue;
        }
        console.warn(`Model ${model} failed, moving to next candidate...`, err?.message || err);
        break;
      }
    }
  }

  throw lastError || new Error('All candidate models failed.');
}

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  if (req.readableEnded) {
    return {};
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
    setTimeout(() => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    }, 1500);
  });
}

function sendJson(res: any, statusCode: number, data: any) {
  if (res.status && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export default async function handler(req: any, res: any) {
  // CORS / Preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (res.status) return res.status(204).end();
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, {
      success: false,
      error: 'Method not allowed. Please use POST.',
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !geminiKey.trim()) {
    return sendJson(res, 503, {
      success: false,
      error: 'Trip planning is temporarily unavailable. Missing Gemini API key.',
      code: 'NO_API_KEY',
    });
  }

  try {
    const body = await parseBody(req);
    const { destination, daysCount, pace, interests, budget, additionalPreferences } = body;

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: 'Please provide a destination for your trip.',
      });
    }

    const input: PlanTripInput = {
      destination: destination.trim(),
      daysCount: Math.min(Math.max(Number(daysCount) || 3, 1), 14),
      pace: pace === 'relaxed' || pace === 'packed' ? pace : 'balanced',
      interests: Array.isArray(interests) ? interests : [],
      budget: budget === 'budget' || budget === 'premium' ? budget : 'moderate',
      additionalPreferences: additionalPreferences ? String(additionalPreferences).trim() : undefined,
    };

    const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });

    const prompt = `Create a cohesive, thoughtfully curated ${input.daysCount}-day travel plan for:
Destination: ${input.destination}
Desired Pace: ${input.pace} (e.g. relaxed = single neighborhood + deep pauses, balanced = moderate rhythm, packed = dawn till dusk)
Interests: ${input.interests.length > 0 ? input.interests.join(', ') : 'Local culture, neighborhood wandering, thoughtful food'}
Budget Tier: ${input.budget}
${input.additionalPreferences ? `Special Traveler Preferences: "${input.additionalPreferences}"` : ''}

Create exactly ${input.daysCount} days in the itinerary. Group each day around a specific district or neighborhood.`;

    const text = await callWithFallback(ai, prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: itineraryResponseSchema,
    });

    const parsed = JSON.parse(text);
    const plan: TripPlanResult = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      destination: parsed.destination || input.destination,
      daysCount: input.daysCount,
      pace: input.pace,
      interests: input.interests,
      budget: input.budget,
      overview: parsed.overview || `A curated journey through ${input.destination}.`,
      days: (parsed.days || []).map((d: any, idx: number) => ({
        dayNumber: d.dayNumber || idx + 1,
        neighborhoodOrArea: d.neighborhoodOrArea || 'Central District',
        theme: d.theme || undefined,
        morning: d.morning || '',
        lunch: d.lunch || '',
        afternoon: d.afternoon || '',
        evening: d.evening || '',
        notes: d.notes || undefined,
      })),
    };

    return sendJson(res, 200, {
      success: true,
      itinerary: plan,
      plan,
    });
  } catch (err: any) {
    console.error('Plan trip error:', err);

    const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
    const isHighDemand = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
    
    let statusCode = 500;
    let errorMessage = 'Unable to create trip plan right now. Please try again.';

    if (is429) {
      statusCode = 429;
      errorMessage = 'Gemini API request limit reached. Please wait a minute or try again shortly.';
    } else if (isHighDemand) {
      statusCode = 503;
      errorMessage = 'AI models are currently experiencing high demand. Please try again in a moment.';
    }

    return sendJson(res, statusCode, {
      success: false,
      error: errorMessage,
      details: err?.message || 'Internal error',
    });
  }
}
