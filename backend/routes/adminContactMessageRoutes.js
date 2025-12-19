import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  listContactMessages,
  replyToContactMessage,
  closeContactMessage,
} from '../controllers/adminContactMessageController.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/', listContactMessages);
router.put('/:id/reply', replyToContactMessage);
router.put('/:id/close', closeContactMessage);

export default router;
