import connectDB from '../config/database.js';
import app from '../serverApp.js';

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  // If you set CORS_ORIGINS on Vercel, prefer reflecting only allowed origins
  const allowList = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!origin) return;

  if (allowList.length === 0 || allowList.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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
