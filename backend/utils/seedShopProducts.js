import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

const DEFAULT_ADMIN = {
  name: 'Admin',
  username: 'admin',
  email: 'admin@Life Changer Way.local',
  whatsapp: '0000000000',
  password: 'admin123',
  isAdmin: true,
};

async function ensureAdminUser() {
  let admin = await User.findOne({ isAdmin: true }).sort({ createdAt: 1 });
  if (admin) return admin;

  console.log('[seed-shop] No admin user found. Creating a default admin user (dev only).');

  const byUsername = await User.findOne({ username: DEFAULT_ADMIN.username });
  if (byUsername) {
    byUsername.isAdmin = true;
    await byUsername.save();
    return byUsername;
  }

  const byEmail = await User.findOne({ email: DEFAULT_ADMIN.email });
  if (byEmail) {
    byEmail.isAdmin = true;
    await byEmail.save();
    return byEmail;
  }

  admin = await User.create(DEFAULT_ADMIN);
  return admin;
}

async function seed() {
  await connectDB();

  const admin = await ensureAdminUser();
  console.log(`[seed-shop] Using admin: ${admin.username} (${admin._id})`);

  const productsToSeed = [
    {
      name: 'Summer Lawn Suit (3pc)',
      description: 'Lightweight lawn suit for summer. 3pc stitched/unstitched options.',
      price: 2999,
      originalPrice: 3999,
      category: 'dresses',
      stock: 25,
      images: [
        'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
    {
      name: 'Casual Kurti (Cotton)',
      description: 'Daily wear cotton kurti. Multiple colors available.',
      price: 1499,
      originalPrice: 1999,
      category: 'dresses',
      stock: 40,
      images: [
        'https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
    {
      name: 'Formal Dress (Embroidery)',
      description: 'Elegant formal dress with embroidery work for events.',
      price: 5499,
      originalPrice: 6999,
      category: 'dresses',
      stock: 12,
      images: [
        'https://images.unsplash.com/photo-1520975682031-a28b49f2f597?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
    {
      name: 'Winter Shawl (Wool Blend)',
      description: 'Warm wool blend shawl for winter season.',
      price: 1899,
      originalPrice: 2499,
      category: 'accessories',
      stock: 30,
      images: [
        'https://images.unsplash.com/photo-1520975693415-35a8ad9e9cb1?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
    {
      name: 'Kids Dress (2-5 years)',
      description: 'Comfortable kids wear dress for ages 2-5.',
      price: 999,
      originalPrice: 1299,
      category: 'kids',
      stock: 50,
      images: [
        'https://images.unsplash.com/photo-1520975862291-9a3f3c9d6cdb?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
    {
      name: 'Men Kurta (Wash & Wear)',
      description: 'Classic men kurta with wash & wear fabric.',
      price: 1799,
      originalPrice: 2299,
      category: 'mens',
      stock: 35,
      images: [
        'https://images.unsplash.com/photo-1520975700956-0d6b0c3d12ac?auto=format&fit=crop&w=900&q=80',
      ],
      status: 'active',
    },
  ];

  let added = 0;
  let skipped = 0;

  for (const p of productsToSeed) {
    const exists = await Product.findOne({ name: p.name, vendor: admin._id });
    if (exists) {
      skipped++;
      continue;
    }

    await Product.create({
      ...p,
      vendor: admin._id,
      vendorCommission: 0,
    });
    added++;
  }

  console.log(`[seed-shop] Done. Added: ${added}, Skipped: ${skipped}`);
}

seed()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[seed-shop] Failed:', err);
    try {
      await mongoose.connection.close();
    } catch {
      // ignore
    }
    process.exit(1);
  });
