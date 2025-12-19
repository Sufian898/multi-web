import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import ClassModel from '../models/Class.js';

dotenv.config();

const DEFAULT_ADMIN = {
  name: 'Admin',
  username: 'admin',
  email: 'admin@multiweb.local',
  whatsapp: '0000000000',
  password: 'admin123',
  isAdmin: true,
};

const makeZoomLink = (id) => `https://zoom.us/j/${id}`;

async function ensureAdminUser() {
  let admin = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
  if (admin) return admin;

  // Create a local default admin (dev convenience)
  console.log('[seed-classes] No admin user found. Creating a default admin user (dev only).');
  const existingByUsername = await User.findOne({ username: DEFAULT_ADMIN.username });
  if (existingByUsername) {
    existingByUsername.isAdmin = true;
    await existingByUsername.save();
    return existingByUsername;
  }

  const existingByEmail = await User.findOne({ email: DEFAULT_ADMIN.email });
  if (existingByEmail) {
    existingByEmail.isAdmin = true;
    await existingByEmail.save();
    return existingByEmail;
  }

  admin = await User.create(DEFAULT_ADMIN);
  return admin;
}

async function seed() {
  await connectDB();

  const admin = await ensureAdminUser();
  console.log(`[seed-classes] Using admin: ${admin.username} (${admin._id})`);

  const now = new Date();
  const classesToSeed = [
    {
      title: 'Web Development Bootcamp - Intro',
      description: 'HTML, CSS basics + roadmap (Live Q&A).',
      zoomLink: makeZoomLink('1112223334'),
      classTime: new Date(now.getTime() - 10 * 60 * 1000),
      status: 'live',
    },
    {
      title: 'JavaScript Fundamentals',
      description: 'Variables, functions, arrays, objects + practice.',
      zoomLink: makeZoomLink('1112223335'),
      classTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: 'upcoming',
    },
    {
      title: 'React Basics',
      description: 'Components, props, state, hooks, and routing overview.',
      zoomLink: makeZoomLink('1112223336'),
      classTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      status: 'upcoming',
    },
    {
      title: 'Node.js + Express Crash Course',
      description: 'Build APIs, routing, middleware, and best practices.',
      zoomLink: makeZoomLink('1112223337'),
      classTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      status: 'upcoming',
    },
    {
      title: 'Database Essentials (MongoDB)',
      description: 'Schemas, CRUD, indexes, and common query patterns.',
      zoomLink: makeZoomLink('1112223338'),
      classTime: new Date(now.getTime() + 72 * 60 * 60 * 1000),
      status: 'upcoming',
    },
    {
      title: 'UI/UX for Developers',
      description: 'Design basics, spacing, typography, and practical UI tips.',
      zoomLink: makeZoomLink('1112223339'),
      classTime: new Date(now.getTime() + 96 * 60 * 60 * 1000),
      status: 'upcoming',
    },
  ];

  let added = 0;
  let skipped = 0;

  for (const c of classesToSeed) {
    const exists = await ClassModel.findOne({
      title: c.title,
      classTime: c.classTime,
    });

    if (exists) {
      skipped++;
      continue;
    }

    await ClassModel.create({
      ...c,
      createdBy: admin._id,
    });
    added++;
  }

  console.log(`[seed-classes] Done. Added: ${added}, Skipped: ${skipped}`);
}

seed()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed-classes] Failed:', err);
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
    process.exit(1);
  });
