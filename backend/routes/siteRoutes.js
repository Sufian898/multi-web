import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { protect, admin } from '../middleware/auth.js';
import {
  getHomeHeroSlider,
  updateHomeHeroSlider,
} from '../controllers/homeHeroSliderController.js';
import { getAppSettings, updateAppSettings } from '../controllers/appSettingsController.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype || '');
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

const sliderUploadDir = path.join(process.cwd(), 'uploads', 'slider');

const hasCloudinary =
  Boolean(process.env.CLOUDINARY_URL) ||
  (Boolean(process.env.CLOUDINARY_CLOUD_NAME) && Boolean(process.env.CLOUDINARY_API_KEY) && Boolean(process.env.CLOUDINARY_API_SECRET));

if (hasCloudinary) {
  cloudinary.config({ secure: true });
}

async function uploadToCloudinary(buffer) {
  return await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'Life Changer Way/slider',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

// Public (Home page reads this)
router.get('/slider', getHomeHeroSlider);
router.get('/settings', getAppSettings);

// Admin only
router.put('/slider', protect, admin, updateHomeHeroSlider);
router.put('/settings', protect, admin, updateAppSettings);

// Admin: upload slide image, returns absolute URL
router.post('/slider/upload', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Prefer Cloudinary in production/serverless
    if (hasCloudinary && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer);
      const url = result?.secure_url || result?.url;
      if (!url) return res.status(500).json({ message: 'Upload failed' });
      return res.json({ url });
    }

    // Local dev fallback: write to disk under /uploads/slider
    fs.mkdirSync(sliderUploadDir, { recursive: true });
    const ext = path.extname(req.file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
    const filename = `slide-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
    const fullPath = path.join(sliderUploadDir, filename);
    fs.writeFileSync(fullPath, req.file.buffer);

    const url = `${req.protocol}://${req.get('host')}/uploads/slider/${filename}`;
    return res.json({ url });
  } catch (error) {
    console.error('slider upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
