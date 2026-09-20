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

  const key = process.env.GEMINI_API_KEY;
  const keyAvailable = Boolean(key && key.trim() !== '');

  const data = {
    status: 'ok',
    hasGeminiKey: keyAvailable,
    environment: 'production',
  };

  if (res.status && typeof res.json === 'function') {
    return res.status(200).json(data);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
