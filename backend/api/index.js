import connectDB from '../config/database.js';
import app from '../serverApp.js';

export default async function handler(req, res) {
  try {
    console.log('[api]', req.method, req.url);
    await connectDB();        // DB connect
    return app(req, res);     // Express ko handover
  } catch (e) {
    console.error('Serverless handler error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
