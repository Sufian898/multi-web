import connectDB from '../config/database.js';
import app from '../serverApp.js';

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const isPreflight = req.method === 'OPTIONS';
  
  // If you set CORS_ORIGINS on Vercel, prefer reflecting only allowed origins
  const allowList = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // For preflight requests, always set CORS headers
  // For other requests, require origin header
  if (!origin && !isPreflight) return;

  // Determine if we should allow this origin
  // If allowList is empty, allow all origins (backwards compatible)
  // If allowList has items, only allow those origins
  const shouldAllow = allowList.length === 0 || (origin && allowList.includes(origin));

  // Always set headers for preflight, or if origin is allowed
  if (shouldAllow || isPreflight) {
    if (origin) {
      // Reflect the origin (required when credentials: true, can't use wildcard)
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (isPreflight) {
      // Preflight without origin header (rare, but handle it)
      // Can't use credentials with wildcard, so set wildcard for preflight only
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
}

export default async function handler(req, res) {
  try {
    // eslint-disable-next-line no-console
    console.log('[api]', req.method, req.url);

    // Always attach CORS headers for browser requests (even on errors / before Express runs)
    setCorsHeaders(req, res);

    // Fast-path preflight: don't force DB connection for OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    await connectDB();
    return app(req, res);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Serverless handler error:', e);
    setCorsHeaders(req, res);
    return res.status(500).json({ message: 'Server error' });
  }
}
