import connectDB from '../backend/config/database.js';
import app from '../backend/serverApp.js';

let isConnected = false;

export default async function handler(req, res) {
  try {
    // Handle preflight
    if (req.method === 'OPTIONS') {
      const origin = req.headers.origin || '*';
      res.setHeader('Access-Control-Allow-Origin', origin);
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
      return res.status(204).end();
    }

    // Connect DB once per cold start
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    // Vercel serverless function receives the full path
    // Express routes are set up with /api prefix, so paths like /api/auth work directly
    // The req.url already contains the full path including /api from Vercel's rewrite
    
    // Log for debugging (remove in production if needed)
    console.log('Request:', req.method, req.url);
    
    // Let Express handle everything
    return app(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

