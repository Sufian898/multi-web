import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import classRoutes from './routes/classRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import dailyTaskRoutes from './routes/dailyTaskRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import contactMessageRoutes from './routes/contactMessageRoutes.js';
import adminContactMessageRoutes from './routes/adminContactMessageRoutes.js';

// Load environment variables
dotenv.config();

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (dev/local). On Vercel, filesystem is ephemeral.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Useful when backend base URL is configured as ".../api"
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/contact-messages', adminContactMessageRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/contact-messages', contactMessageRoutes);

// API 404 (prevents Vercel default "Page Not Found" for unknown API paths)
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

export default app;
