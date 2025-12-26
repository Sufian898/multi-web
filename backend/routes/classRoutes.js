import express from 'express';
import {
  getClasses,
  getLiveClasses,
  getMyClasses,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';
import { protect } from '../middleware/auth.js';
import { teacherApproved } from '../middleware/teacher.js';

const router = express.Router();

router.get('/', getClasses);
router.get('/live', getLiveClasses);
router.get('/mine', protect, teacherApproved, getMyClasses);

router.use(protect);

router.post('/', teacherApproved, createClass);
router.put('/:id', teacherApproved, updateClass);
router.delete('/:id', teacherApproved, deleteClass);

export default router;

