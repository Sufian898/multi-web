import express from 'express';
import {
  getAllUsers,
  getUserDetails,
  toggleBlockUser,
  approveVendor,
  rejectVendor,
  getDashboardStats,
  getPendingBlogs,
  getPendingSubmissions
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/block', toggleBlockUser);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.get('/stats', getDashboardStats);
router.get('/blogs/pending', getPendingBlogs);
router.get('/tasks/submissions/pending', getPendingSubmissions);

export default router;

