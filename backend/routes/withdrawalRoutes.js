import express from 'express';
import {
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal
} from '../controllers/withdrawalController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/', requestWithdrawal);
router.get('/', getMyWithdrawals);

// Admin routes
router.get('/all', admin, getAllWithdrawals);
router.put('/:id/approve', admin, approveWithdrawal);
router.put('/:id/reject', admin, rejectWithdrawal);

export default router;

