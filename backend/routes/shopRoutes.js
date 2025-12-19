import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  addToCart,
  getCart,
  createOrder,
  getMyOrders,
  getVendorOrders,
  updateOrderStatus,
  registerVendor,
  getAllProductsAdmin,
  getAllOrdersAdmin,
  deleteProductAdmin
} from '../controllers/shopController.js';
import { protect, vendor, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/products', getProducts);
router.get('/products/:id', getProduct);

router.use(protect);

// Admin routes
router.get('/admin/products', admin, getAllProductsAdmin);
router.get('/admin/orders', admin, getAllOrdersAdmin);

router.post('/vendor/register', registerVendor);
router.post('/cart', addToCart);
router.get('/cart', getCart);
router.post('/orders', createOrder);
router.get('/orders', getMyOrders);

// Vendor routes
router.post('/products', vendor, createProduct);
router.put('/products/:id', vendor, updateProduct);
router.get('/vendor/orders', vendor, getVendorOrders);
router.put('/orders/:id/status', vendor, updateOrderStatus);

// Admin can also manage products
router.put('/products/:id/admin', admin, updateProduct);
router.delete('/products/:id/admin', admin, deleteProductAdmin);

export default router;

