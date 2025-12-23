import connectDB from '../config/database.js';
import app from '../serverApp.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
