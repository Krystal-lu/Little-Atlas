import { generateTripPlan, hasGeminiKey, PlanTripInput } from './_lib/geminiService';

async function parseBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
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
  });
}

export default async function handler(req: any, res: any) {
  // CORS / Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (res.status) {
      return res.status(204).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    const errorBody = { error: 'Method not allowed. Use POST.' };
    if (res.status) return res.status(405).json(errorBody);
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errorBody));
  }

  if (!hasGeminiKey()) {
    const errorBody = {
      error: 'Trip planning is temporarily unavailable.',
      code: 'NO_API_KEY',
    };
    if (res.status) return res.status(503).json(errorBody);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errorBody));
  }

  try {
    const body = await parseBody(req);
    const { destination, daysCount, pace, interests, budget, additionalPreferences } = body;

    if (!destination || typeof destination !== 'string' || !destination.trim()) {
      const errorBody = { error: 'Destination is required.' };
      if (res.status) return res.status(400).json(errorBody);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorBody));
    }

    const input: PlanTripInput = {
      destination: destination.trim(),
      daysCount: Math.min(Math.max(Number(daysCount) || 3, 1), 14),
      pace: pace === 'relaxed' || pace === 'packed' ? pace : 'balanced',
      interests: Array.isArray(interests) ? interests : [],
      budget: budget === 'budget' || budget === 'premium' ? budget : 'moderate',
      additionalPreferences: additionalPreferences ? String(additionalPreferences).trim() : undefined,
    };

    const plan = await generateTripPlan(input);

    const responseBody = { plan };
    if (res.status && typeof res.json === 'function') {
      return res.status(200).json(responseBody);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(responseBody));
  } catch (err: any) {
    console.error('Plan trip error:', err);

    if (err?.code === 'NO_API_KEY') {
      const errorBody = {
        error: 'Trip planning is temporarily unavailable.',
        code: 'NO_API_KEY',
      };
      if (res.status) return res.status(503).json(errorBody);
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorBody));
    }

    const errorBody = {
      error: 'We couldn’t create your trip plan right now. Please try again.',
      details: err?.message || 'Unknown error',
    };
    if (res.status) return res.status(500).json(errorBody);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(errorBody));
  }
}
