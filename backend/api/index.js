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
  // Ensure we always send a response, even on errors
  try {
    // eslint-disable-next-line no-console
    console.log('[api] Handler called:', req.method, req.url, 'Origin:', req.headers.origin);

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
      
      console.log('[api] Preflight response sent');
      return res.status(204).end();
    }

    // For actual requests, set CORS headers
    setCorsHeaders(req, res);

    // Connect to database (with error handling)
    try {
      console.log('[api] Connecting to database...');
      await connectDB();
      console.log('[api] Database connected');
    } catch (dbError) {
      console.error('[api] Database connection error:', dbError.message);
      console.error('[api] Database error stack:', dbError.stack);
      // Don't crash - continue without DB connection for routes that don't need it
      // Some routes might work without DB (like health checks)
    }

    // Express app handles the request/response
    // Wrap in promise to ensure Vercel waits for response
    console.log('[api] Calling Express app...');
    return new Promise((resolve, reject) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.error('[api] Timeout waiting for Express response');
          if (!res.headersSent) {
            setCorsHeaders(req, res);
            res.status(504).json({ message: 'Request timeout' });
          }
          resolve();
        }
      }, 25000); // 25 second timeout
      
      // Track when response finishes
      const finish = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.log('[api] Response finished');
          resolve();
        }
      };

      // Override res.end
      const originalEnd = res.end.bind(res);
      res.end = function(...args) {
        if (!resolved) {
          originalEnd(...args);
          finish();
        } else {
          originalEnd(...args);
        }
      };

      // Listen for finish/close events
      res.once('finish', finish);
      res.once('close', finish);

      // Call Express app
      try {
        if (!app) {
          throw new Error('Express app not initialized');
        }
        app(req, res);
      } catch (syncError) {
        console.error('[api] Sync error calling Express app:', syncError.message);
        console.error('[api] Sync error stack:', syncError.stack);
        if (!resolved && !res.headersSent) {
          setCorsHeaders(req, res);
          res.status(500).json({ 
            message: 'Server error',
            error: syncError.message 
          });
          finish();
        } else {
          finish();
        }
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[api] Top-level handler error:', e.message);
    console.error('[api] Error stack:', e.stack);
    try {
      setCorsHeaders(req, res);
      if (!res.headersSent) {
        return res.status(500).json({ 
          message: 'Server error', 
          error: e.message || 'Internal server error'
        });
      }
    } catch (responseError) {
      console.error('[api] Error sending error response:', responseError);
    }
  }
}
