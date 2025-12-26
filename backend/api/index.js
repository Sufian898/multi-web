import connectDB from '../backend/config/database.js';
import app from '../backend/serverApp.js';

let isConnected = false;

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

    // Connect DB once per cold start
    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    // Vercel serverless function receives the full path
    // Express routes are set up with /api prefix, so paths like /api/auth work directly
    // The req.url already contains the full path including /api from Vercel's rewrite
    
    // Log for debugging (remove in production if needed)
    console.log('Request:', req.method, req.url, 'Origin:', origin);
    
    // Let Express handle everything
    return app(req, res);
  } catch (err) {
    console.error('Vercel handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
}

