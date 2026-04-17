import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Protected routes
userRouter.get('/get-profile', authMiddleware, getUserProfile);
userRouter.put('/update-profile', authMiddleware, updateUserProfile);

export default userRouter;
