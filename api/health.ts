export default async function handler(req: any, res: any) {
  // CORS / Preflight handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (res.status) return res.status(204).end();
    res.statusCode = 204;
    return res.end();
  }

  const geminiKey = process.env.GEMINI_API_KEY;

  const data = {
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY?.trim()),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
  };

  if (res.status && typeof res.json === 'function') {
    return res.status(200).json(data);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
