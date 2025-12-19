import express from 'express';
import {
  getClasses,
  getLiveClasses,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getClasses);
router.get('/live', getLiveClasses);

router.use(protect);
router.use(admin);

router.post('/', createClass);
router.put('/:id', updateClass);
router.delete('/:id', deleteClass);

export default router;

