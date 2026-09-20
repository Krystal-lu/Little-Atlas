import { reviseTripPlan, hasGeminiKey, ReviseTripInput } from './_lib/geminiService';

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
    const { currentPlan, revisionPrompt } = body;

    if (!currentPlan || !currentPlan.destination || !Array.isArray(currentPlan.days)) {
      const errorBody = { error: 'Valid currentPlan object is required.' };
      if (res.status) return res.status(400).json(errorBody);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorBody));
    }

    if (!revisionPrompt || typeof revisionPrompt !== 'string' || !revisionPrompt.trim()) {
      const errorBody = { error: 'Revision prompt is required.' };
      if (res.status) return res.status(400).json(errorBody);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(errorBody));
    }

    const input: ReviseTripInput = {
      currentPlan,
      revisionPrompt: revisionPrompt.trim(),
    };

    const plan = await reviseTripPlan(input);

    const responseBody = { plan };
    if (res.status && typeof res.json === 'function') {
      return res.status(200).json(responseBody);
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(responseBody));
  } catch (err: any) {
    console.error('Revise trip error:', err);

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
