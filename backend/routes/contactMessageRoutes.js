import express from 'express';
import { createContactMessage, getContactMessageByTrackingCode } from '../controllers/contactMessageController.js';

const router = express.Router();

router.post('/', createContactMessage);
router.get('/track/:code', getContactMessageByTrackingCode);

export default router;
