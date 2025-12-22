import express from 'express';
import {
  getBlogs,
  getBlog,
  createBlog,
  getMyBlogs,
  updateBlog,
  approveBlog,
  rejectBlog,
  updateBlogRevenue
} from '../controllers/blogController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlog);

router.use(protect);

router.post('/', createBlog);
router.get('/my-blogs', getMyBlogs);
router.put('/:id', updateBlog);

// Admin routes
router.put('/:id/approve', admin, approveBlog);
router.put('/:id/reject', admin, rejectBlog);
router.put('/:id/revenue', admin, updateBlogRevenue);

export default router;

