import express from 'express';
import {
  getAllDailyTasks,
  getActiveDailyTasks,
  createDailyTask,
  updateDailyTask,
  deleteDailyTask,
  completeDailyTask
} from '../controllers/dailyTaskController.js';
import {
  updateWatchTime,
  getWatchTime,
  getAllWatchTimes,
  getVideoEarnings
} from '../controllers/videoWatchTimeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get active tasks
router.get('/', getActiveDailyTasks);

// Protected route - Complete task
router.post('/:id/complete', protect, completeDailyTask);

// Watch time routes
router.get('/video-earnings', protect, getVideoEarnings);
router.get('/:taskId/watch-time', protect, getWatchTime);
router.put('/:taskId/watch-time', protect, updateWatchTime);

// Admin routes - all tasks
router.get('/admin/all', protect, admin, getAllDailyTasks);
router.post('/admin', protect, admin, createDailyTask);
router.put('/admin/:id', protect, admin, updateDailyTask);
router.delete('/admin/:id', protect, admin, deleteDailyTask);
router.get('/admin/:taskId/watch-times', protect, admin, getAllWatchTimes);

export default router;

