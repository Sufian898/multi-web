import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  registerVendor,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  deleteProductAdmin,
  getVendorProducts
} from '../controllers/shopController.js';
import { protect, vendor, admin } from '../middleware/auth.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype || '');
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  },
});

const productUploadDir = path.join(process.cwd(), 'uploads', 'products');

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
        folder: 'Life Changer Way/products',
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

router.get('/products', getProducts);
router.get('/products/:id', getProduct);

router.use(protect);

// Admin routes
router.get('/admin/products', admin, getAllProductsAdmin);
router.get('/admin/orders', admin, getAllOrdersAdmin);

router.post('/vendor/register', registerVendor);
router.post('/cart', addToCart);
router.get('/cart', getCart);
router.put('/cart', updateCartItem);
router.delete('/cart', clearCart);
router.delete('/cart/:productId', removeFromCart);
router.post('/orders', createOrder);
router.get('/orders', getMyOrders);

// Vendor routes
router.get('/vendor/products', vendor, getVendorProducts);
// Upload product images (returns absolute URLs)
router.post('/products/upload-images', vendor, upload.array('images', 6), async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) return res.status(400).json({ message: 'No images uploaded' });

    const urls = [];

    for (const f of files) {
      if (hasCloudinary && f.buffer) {
        const result = await uploadToCloudinary(f.buffer);
        const url = result?.secure_url || result?.url;
        if (url) urls.push(url);
        continue;
      }

      fs.mkdirSync(productUploadDir, { recursive: true });
      const ext = path.extname(f.originalname || '').toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
      const filename = `product-${Date.now()}-${Math.random().toString(16).slice(2)}${safeExt}`;
      const fullPath = path.join(productUploadDir, filename);
      fs.writeFileSync(fullPath, f.buffer);
      const url = `${req.protocol}://${req.get('host')}/uploads/products/${filename}`;
      urls.push(url);
    }

    return res.json({ urls });
  } catch (error) {
    console.error('product image upload error:', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
});
router.post('/products', vendor, createProduct);
router.put('/products/:id', vendor, updateProduct);
router.get('/vendor/orders', vendor, getVendorOrders);
router.put('/orders/:id/status', vendor, updateOrderStatus);

// Admin can also manage products
router.put('/products/:id/admin', admin, updateProduct);
router.delete('/products/:id/admin', admin, deleteProductAdmin);

export default router;

