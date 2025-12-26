import express from 'express';
import multer from 'multer';
import {
  registerTeacher,
  getAllTeachers,
  getTeacher,
  updateTeacherStatus,
  deleteTeacher,
  checkTeacherRegistration,
  uploadTeacherResume
} from '../controllers/teacherController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

const CV_MAX_BYTES = 20 * 1024 * 1024; // 20MB

const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: CV_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    const isPdfMime = (file.mimetype || '').toLowerCase() === 'application/pdf';
    const isPdfExt = (file.originalname || '').toLowerCase().endsWith('.pdf');
    const ok = isPdfMime || isPdfExt;
    cb(ok ? null : new Error('Only PDF files are allowed'), ok);
  },
});

router.post('/register', protect, registerTeacher);
router.post('/upload-resume', protect, (req, res, next) => {
  uploadPdf.single('cv')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: `CV file is too large. Max ${Math.floor(CV_MAX_BYTES / (1024 * 1024))}MB` });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }

    return res.status(400).json({ message: err.message || 'Upload failed' });
  });
}, uploadTeacherResume);
router.get('/check', protect, checkTeacherRegistration);
router.get('/', protect, admin, getAllTeachers);
router.get('/:id', protect, getTeacher);
router.put('/:id/status', protect, admin, updateTeacherStatus);
router.delete('/:id', protect, admin, deleteTeacher);

export default router;
