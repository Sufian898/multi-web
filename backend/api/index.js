import connectDB from '../config/database.js';
import app from '../serverApp.js';

const allowedOrigins = [
  'https://lifechangerway.com',
  'http://localhost:5173'
];

export default async function handler(req, res) {
  try {
    const origin = req.headers.origin;
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

    // Connect DB and pass request to Express app
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
