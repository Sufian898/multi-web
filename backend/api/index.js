import connectDB from '../config/database.js';
import app from '../serverApp.js';

export default async function handler(req, res) {
  try {
    // CORS headers directly in serverless function
    const allowedOrigins = [
      'https://lifechangerway.com',
      'http://localhost:5173'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    await connectDB();
    return app(req, res);
  } catch (e) {
    console.error('Serverless handler error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
