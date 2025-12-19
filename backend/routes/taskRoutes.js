import express from 'express';
import {
  createTask,
  getTasks,
  submitTask,
  getMySubmissions,
  approveSubmission,
  rejectSubmission
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.post('/:taskId/submit', submitTask);
router.get('/my-submissions', getMySubmissions);

// Admin routes
router.put('/submissions/:submissionId/approve', admin, approveSubmission);
router.put('/submissions/:submissionId/reject', admin, rejectSubmission);

export default router;

