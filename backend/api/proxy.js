export default async function handler(req, res) {
  // Basic CORS handling - allow the configured origin or all if not set
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const origin = req.headers.origin || '';
  const corsOrigin = allowedOrigin === '*' ? '*' : allowedOrigin;
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Secret');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST for actual requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional origin check (if ALLOWED_ORIGIN is set to a specific origin)
  if (process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== '*' && origin && origin !== process.env.ALLOWED_ORIGIN) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  // Optional client secret check to reduce abuse
  const clientSecret = process.env.CLIENT_SECRET;
  if (clientSecret) {
    const provided = req.headers['x-client-secret'];
    if (!provided || provided !== clientSecret) {
      return res.status(401).json({ error: 'Missing or invalid client secret' });
    }
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing OPENROUTER_API_KEY' });
  }

  try {
    // Forward the request body to OpenRouter (adjust endpoint if your provider differs)
    const upstreamResp = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify(req.body),
    });

    const contentType = upstreamResp.headers.get('content-type') || 'application/json';
    const text = await upstreamResp.text();

    // Mirror CORS headers on the proxied response
    res.setHeader('Content-Type', contentType);
    res.status(upstreamResp.status).send(text);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(502).json({ error: 'Bad gateway', details: err.message });
  }
}
