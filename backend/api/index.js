import connectDB from '../config/database.js';
import app from '../serverApp.js';

const allowedOrigins = [
  'https://lifechangerway.com',  // production frontend
  'http://localhost:5173'        // local dev
];

export default async function handler(req, res) {
  try {
    const origin = req.headers.origin;

    // Set CORS headers manually
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // Connect to DB
    await connectDB();

    // Pass request to Express app
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
