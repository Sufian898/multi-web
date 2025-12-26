import connectDB from '../config/database.js';
import app from '../serverApp.js';

let isConnected = false;

export default async function handler(req, res) {
  try {
    console.log('[API]', req.method, req.url);

    if (!isConnected) {
      await connectDB();
      isConnected = true;
    }

    return app(req, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
