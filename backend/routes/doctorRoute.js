import express from 'express';
import { loginDoctor, getDoctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import { getAllDoctors, getDoctorById, getRelatedDoctors } from '../controllers/doctorListController.js';
import { getDoctorDashboard } from '../controllers/doctorDashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const doctorRouter = express.Router();

// Public routes
doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/list', getAllDoctors);
doctorRouter.get('/:doctorId', getDoctorById);
doctorRouter.get('/related/:doctorId', getRelatedDoctors);

// Protected routes
doctorRouter.get('/get-profile', authMiddleware, getDoctorProfile);
doctorRouter.put('/update-profile', authMiddleware, updateDoctorProfile);
doctorRouter.get('/dashboard', authMiddleware, getDoctorDashboard);

export default doctorRouter;