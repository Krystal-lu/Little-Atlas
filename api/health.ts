import { hasGeminiKey } from './_lib/geminiService';

export default async function handler(req: any, res: any) {
  // Allow GET and OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (res.status) {
      return res.status(204).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  const keyAvailable = hasGeminiKey();

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
