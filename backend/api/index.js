import connectDB from '../config/database.js';
import app from '../serverApp.jsx';   // 👈 ROOT se import

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;

  res.setHeader('Access-Control-Allow-Origin', origin || 'https://atsjourney.com');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
}

export default async function handler(req, res) {
  try {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error(err);
    setCorsHeaders(req, res);
    return res.status(500).json({ message: 'Server error' });
  }
}
