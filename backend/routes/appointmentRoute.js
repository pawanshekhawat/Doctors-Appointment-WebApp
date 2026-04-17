import express from 'express';
import {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    cancelByDoctor,
    getDoctorAppointments,
    completeAppointment,
} from '../controllers/appointmentController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const appointmentRouter = express.Router();

// All routes protected
appointmentRouter.post('/book', authMiddleware, bookAppointment);
appointmentRouter.get('/user-appointments', authMiddleware, getUserAppointments);
appointmentRouter.put('/cancel/:appointmentId', authMiddleware, cancelAppointment);
appointmentRouter.put('/cancel-by-doctor/:appointmentId', authMiddleware, cancelByDoctor);
appointmentRouter.get('/doctor-appointments', authMiddleware, getDoctorAppointments);
appointmentRouter.put('/complete/:appointmentId', authMiddleware, completeAppointment);

export default appointmentRouter;