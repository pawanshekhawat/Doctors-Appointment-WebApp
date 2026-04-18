import express from 'express';
import { loginDoctor, getDoctorProfile, updateDoctorProfile } from '../controllers/doctorController.js';
import { getAllDoctors, getDoctorById, getRelatedDoctors, getDoctorSlots } from '../controllers/doctorListController.js';
import { getDoctorDashboard } from '../controllers/doctorDashboardController.js';
import authMiddleware, { requireRole } from '../middleware/authMiddleware.js';

const doctorRouter = express.Router();

doctorRouter.post('/login', loginDoctor);
doctorRouter.get('/list', getAllDoctors);
doctorRouter.get('/get-profile', authMiddleware, requireRole('doctor'), getDoctorProfile);
doctorRouter.put('/update-profile', authMiddleware, requireRole('doctor'), updateDoctorProfile);
doctorRouter.get('/dashboard', authMiddleware, requireRole('doctor'), getDoctorDashboard);
doctorRouter.get('/:doctorId', getDoctorById);
doctorRouter.get('/related/:doctorId', getRelatedDoctors);
doctorRouter.get('/slots/:doctorId', getDoctorSlots);

export default doctorRouter;
