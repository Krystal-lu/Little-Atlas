import { GoogleGenAI, Type } from '@google/genai';

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
1. Focus on coherence and sense of place. Group each day within one or two adjacent walkable neighborhoods.
2. Use respectful, gentle language ("Consider", "Possible option", "Worth checking", "You might wander toward").
3. Avoid generic tourist checklist clichés. Include independent bookshops, artisan studios, quiet temple alleys, tucked-away tea houses, river walks, and neighborhood bakeries.
4. Tone: Warm, evocative, personal, and poetic yet entirely realistic. Like notes handwritten into a personal clothbound travel journal.`;

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
    const { currentPlan, revisionPrompt } = body;

    if (!currentPlan || !currentPlan.destination || !Array.isArray(currentPlan.days)) {
      return sendJson(res, 400, {
        success: false,
        error: 'A valid existing itinerary is required to make adjustments.',
      });
    }

    if (!revisionPrompt || typeof revisionPrompt !== 'string' || !revisionPrompt.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: 'Please describe the adjustment you would like to make.',
      });
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });

    const prompt = `You are revising an existing travel itinerary for Little Atlas according to the traveler's request.

CURRENT ITINERARY:
${JSON.stringify(currentPlan, null, 2)}

TRAVELER'S REVISION REQUEST:
"${revisionPrompt.trim()}"

REVISION INSTRUCTIONS:
1. Apply the traveler's requested changes directly and thoughtfully.
2. If the user asks to change a specific day (e.g. "Day 2 is too busy. Make it more relaxed."), modify that specific day while preserving the rest of the itinerary unchanged.
3. If the user asks to add or remove certain activities (e.g. "no museums", "more coffee shops", "add shopping"), adjust relevant days accordingly while keeping the general geographic structure intact.
4. Keep the exact same number of days (${currentPlan.days.length} days).
5. Maintain the existing destination: ${currentPlan.destination}.
6. Keep language soft, respectful, and observational (e.g., "Consider", "Possible option", "Worth checking").
7. Return the full updated itinerary matching the structured schema.`;

    const text = await callWithFallback(ai, prompt, {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: itineraryResponseSchema,
    });

    const parsed = JSON.parse(text);
    const updatedPlan: TripPlanResult = {
      id: currentPlan.id || `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      destination: parsed.destination || currentPlan.destination,
      daysCount: currentPlan.daysCount || currentPlan.days.length,
      pace: currentPlan.pace,
      interests: currentPlan.interests,
      budget: currentPlan.budget,
      overview: parsed.overview || currentPlan.overview,
      days: (parsed.days || []).map((d: any, idx: number) => ({
        dayNumber: d.dayNumber || idx + 1,
        neighborhoodOrArea: d.neighborhoodOrArea || currentPlan.days[idx]?.neighborhoodOrArea || 'District',
        theme: d.theme || currentPlan.days[idx]?.theme || undefined,
        morning: d.morning || currentPlan.days[idx]?.morning || '',
        lunch: d.lunch || currentPlan.days[idx]?.lunch || '',
        afternoon: d.afternoon || currentPlan.days[idx]?.afternoon || '',
        evening: d.evening || currentPlan.days[idx]?.evening || '',
        notes: d.notes || currentPlan.days[idx]?.notes || undefined,
      })),
    };

    return sendJson(res, 200, {
      success: true,
      itinerary: updatedPlan,
      plan: updatedPlan,
    });
  } catch (err: any) {
    console.error('Revise trip error:', err);

    const is429 = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED') || err?.message?.includes('quota');
    const isHighDemand = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('UNAVAILABLE') || err?.message?.includes('high demand');
    
    let statusCode = 500;
    let errorMessage = 'Unable to update your trip plan right now. Please try again.';

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
