# OpenRouter Proxy (Vercel)

This folder contains a minimal serverless proxy to forward requests from a public frontend to OpenRouter without exposing your API key.

Files
- `api/proxy.js` - Vercel Serverless Function. Accepts POST and forwards to OpenRouter.
- `package.json` - minimal manifest.
- `vercel.json` - sets Node runtime for functions.

Environment variables (set these in Vercel Project > Settings > Environment Variables):
- `OPENROUTER_API_KEY` (required) - your OpenRouter secret.
- `ALLOWED_ORIGIN` (optional) - exact origin for GitHub Pages, e.g. `https://icoderbug.github.io` or `https://icoderbug.github.io/ChatBot`.
- `CLIENT_SECRET` (optional) - a random string. If set, the frontend must send `X-Client-Secret` header with that value.

Deploying with Vercel CLI (PowerShell)

1. Install Vercel CLI:

```powershell
npm i -g vercel
```

2. Login and deploy:

```powershell
vercel login
cd backend
vercel # follow prompts to link/create project
# or deploy to production
vercel --prod --confirm
```

3. Add environment variables via CLI:

```powershell
vercel env add OPENROUTER_API_KEY production
vercel env add ALLOWED_ORIGIN production
vercel env add CLIENT_SECRET production
```

After deployment you'll get a URL like `https://<project>.vercel.app` — use that as `API_BASE` in your frontend `config.js`.

Security notes
- Do NOT store `OPENROUTER_API_KEY` in frontend code or in the repo.
- Use `ALLOWED_ORIGIN` and/or `CLIENT_SECRET` to limit abuse.
- Consider rate-limiting or user auth for production.
