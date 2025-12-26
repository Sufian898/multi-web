import connectDB from '../config/database.js';
import app from '../serverApp.js';

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_LOCAL
].filter(Boolean); // remove undefined

export default async function handler(req, res) {
  try {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
