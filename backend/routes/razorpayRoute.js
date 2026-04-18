import express from 'express';
import { createOrder, verifyPayment } from '../controllers/razorpayController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/authMiddleware.js';

const razorpayRouter = express.Router();

razorpayRouter.post('/create-order', authMiddleware, requireRole('user'), createOrder);
razorpayRouter.put('/verify-payment', authMiddleware, requireRole('user'), verifyPayment);

export default razorpayRouter;