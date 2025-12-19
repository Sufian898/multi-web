import express from 'express';
import {
  registerTeacher,
  getAllTeachers,
  getTeacher,
  updateTeacherStatus,
  deleteTeacher,
  checkTeacherRegistration
} from '../controllers/teacherController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, registerTeacher);
router.get('/check', protect, checkTeacherRegistration);
router.get('/', protect, admin, getAllTeachers);
router.get('/:id', protect, getTeacher);
router.put('/:id/status', protect, admin, updateTeacherStatus);
router.delete('/:id', protect, admin, deleteTeacher);

export default router;
