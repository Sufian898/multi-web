import connectDB from '../config/database.js';
import app from '../serverApp.js';

export default async function handler(req, res) {
  try {
    // eslint-disable-next-line no-console
    console.log('[api]', req.method, req.url);
    await connectDB();
    return app(req, res);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Serverless handler error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
}
