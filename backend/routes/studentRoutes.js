import express from 'express';
import {
  registerStudent,
  getAllStudents,
  getStudent,
  updateStudentStatus,
  deleteStudent,
  checkStudentRegistration
} from '../controllers/studentController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', protect, registerStudent);
router.get('/check', protect, checkStudentRegistration);
router.get('/', protect, admin, getAllStudents);
router.get('/:id', protect, getStudent);
router.put('/:id/status', protect, admin, updateStudentStatus);
router.delete('/:id', protect, admin, deleteStudent);

export default router;
