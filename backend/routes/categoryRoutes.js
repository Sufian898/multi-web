import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', protect, admin, createCategory);
router.post('/seed', protect, admin, seedCategories);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

export default router;
