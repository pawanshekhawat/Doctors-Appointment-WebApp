import express from 'express';
import {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    cancelByDoctor,
    getDoctorAppointments,
    completeAppointment,
} from '../controllers/appointmentController.js';
import authMiddleware, { requireRole } from '../middleware/authMiddleware.js';

const appointmentRouter = express.Router();

appointmentRouter.post('/book', authMiddleware, requireRole('user'), bookAppointment);
appointmentRouter.get('/user-appointments', authMiddleware, requireRole('user'), getUserAppointments);
appointmentRouter.put('/cancel/:appointmentId', authMiddleware, requireRole('user'), cancelAppointment);
appointmentRouter.put('/cancel-by-doctor/:appointmentId', authMiddleware, requireRole('doctor'), cancelByDoctor);
appointmentRouter.get('/doctor-appointments', authMiddleware, requireRole('doctor'), getDoctorAppointments);
appointmentRouter.put('/complete/:appointmentId', authMiddleware, requireRole('doctor'), completeAppointment);

export default appointmentRouter;
