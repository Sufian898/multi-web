let connectDB, app, isConnected = false;

// Lazy load to catch import errors early
async function loadBackend() {
  if (!connectDB || !app) {
    try {
      console.log('Loading backend modules...');
      const dbModule = await import('../backend/config/database.js');
      const appModule = await import('../backend/serverApp.js');
      connectDB = dbModule.default;
      app = appModule.app || appModule.default;
      console.log('Backend modules loaded successfully');
    } catch (importError) {
      console.error('Error importing backend modules:', importError);
      throw new Error(`Failed to import backend: ${importError.message}`);
    }
  }
  return { connectDB, app };
}

export default async function handler(req, res) {
  try {
    // Set CORS headers for all requests
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://lifechangerway.com',
      'https://www.lifechangerway.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000'
    ];
    
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Allow requests with no origin (like Postman, server-to-server)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
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

    // Vercel serverless function receives the full path
    // Express routes are set up with /api prefix, so paths like /api/auth work directly
    // The req.url already contains the full path including /api from Vercel's rewrite
    
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

