import express from "express";
import { addDoctor, loginAdmin } from "../controllers/adminController.js";
import { getAdminDashboard, getAllDoctorsAdmin, deleteDoctor, getAllAppointmentsAdmin, cancelAdminAppointment } from "../controllers/adminDashboardController.js";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

// Public
adminRouter.post('/login', loginAdmin);

// Protected - admin only
adminRouter.post('/add-doctor', authMiddleware, upload.single('image'), addDoctor);
adminRouter.get('/dashboard', authMiddleware, getAdminDashboard);
adminRouter.get('/doctors', authMiddleware, getAllDoctorsAdmin);
adminRouter.delete('/doctor/:doctorId', authMiddleware, deleteDoctor);
adminRouter.get('/appointments', authMiddleware, getAllAppointmentsAdmin);
adminRouter.put('/appointment/:appointmentId', authMiddleware, cancelAdminAppointment);

export default adminRouter;
