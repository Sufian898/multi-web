let connectDB, app, isConnected = false;

// Lazy load to catch import errors early
async function loadBackend() {
  if (!connectDB || !app) {
    try {
      console.log('Loading backend modules from backend/api/index.js...');
      const dbModule = await import('../config/database.js');
      const appModule = await import('../serverApp.js');
      connectDB = dbModule.default;
      app = appModule.app || appModule.default;
      console.log('Backend modules loaded successfully');
    } catch (importError) {
      console.error('Error importing backend modules:', importError);
      console.error('Import error stack:', importError.stack);
      throw new Error(`Failed to import backend: ${importError.message}`);
    }
  }
  return { connectDB, app };
}

export default async function handler(req, res) {
  try {
    // Set CORS headers for all requests (especially important for preflight)
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://lifechangerway.com',
      'https://www.lifechangerway.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000'
    ];
    
    // Always set CORS headers, especially for preflight requests
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (origin) {
      // Origin present but not in allowed list - still set header for preflight
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // No origin (server-to-server, Postman)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS preflight request from origin:', origin);
      return res.status(204).end();
    }

    // Load backend modules
    const { connectDB: dbConnect, app: expressApp } = await loadBackend();

    // Connect DB once per cold start
    if (!isConnected) {
      console.log('Connecting to database...');
      await dbConnect();
      isConnected = true;
      console.log('Database connected');
    }

    // Log for debugging
    console.log('Request:', req.method, req.url, 'Origin:', origin);
    
    // Let Express handle everything
    return new Promise((resolve, reject) => {
      expressApp(req, res, (err) => {
        if (err) {
          console.error('Express error:', err);
          if (!res.headersSent) {
            res.status(500).json({ message: 'Server error', error: err.message });
          }
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('Vercel handler error:', err);
    console.error('Stack:', err.stack);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Server error', 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
}
