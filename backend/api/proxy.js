export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Origin check (optional) - set ALLOWED_ORIGIN in Vercel to your GitHub Pages origin
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const origin = req.headers.origin || '';
  if (allowedOrigin && origin !== allowedOrigin) {
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

    res.status(upstreamResp.status);
    res.setHeader('Content-Type', contentType);
    res.send(text);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(502).json({ error: 'Bad gateway', details: err.message });
  }
}
