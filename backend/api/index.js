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

  // CRITICAL: Preflight requests MUST always get CORS headers
  // Otherwise browser will block the actual request before it's even sent
  if (isPreflight) {
    if (origin) {
      // Reflect the origin (required when credentials: true, can't use wildcard)
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Preflight without origin header (rare, but handle it)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return; // Early return for preflight
  }

  // For actual requests (non-preflight), check origin against allowList
  if (!origin) return;

  // Determine if we should allow this origin
  // If allowList is empty, allow all origins (backwards compatible)
  // If allowList has items, only allow those origins
  const shouldAllow = allowList.length === 0 || allowList.includes(origin);

  if (shouldAllow) {
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
    console.log('[api]', req.method, req.url, 'Origin:', req.headers.origin);

    // CRITICAL: Handle preflight requests FIRST, before anything else
    // Preflight MUST always succeed, otherwise browser won't send actual request
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin;
      
      // Always reflect the origin for preflight (browser needs this)
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      } else {
        // No origin header (rare) - allow all
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
      
      return res.status(204).end();
    }

    // For actual requests, set CORS headers
    setCorsHeaders(req, res);

    // Connect to database (with error handling)
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Don't crash - continue without DB connection for routes that don't need it
      // Some routes might work without DB (like health checks)
    }

    // Express app handles the request/response
    // In Vercel serverless, Express app handles everything internally
    app(req, res);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Serverless handler error:', e);
    console.error('Error stack:', e.stack);
    setCorsHeaders(req, res);
    if (!res.headersSent) {
      return res.status(500).json({ 
        message: 'Server error', 
        error: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error' 
      });
    }
  }
}
