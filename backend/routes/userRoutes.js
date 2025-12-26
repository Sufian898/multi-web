import express from 'express';
import { getDashboard, updateProfile, getReferrals } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.get('/referrals', getReferrals);

export default router;

