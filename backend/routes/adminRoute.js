import express from "express";
import { addDoctor, loginAdmin } from "../controllers/adminController.js";
import { getAdminDashboard, getAllDoctorsAdmin, deleteDoctor, getAllAppointmentsAdmin, cancelAdminAppointment } from "../controllers/adminDashboardController.js";
import upload from "../middleware/multer.js";
import authMiddleware, { requireRole } from "../middleware/authMiddleware.js";

const adminRouter = express.Router();

adminRouter.post('/login', loginAdmin);

adminRouter.post('/add-doctor', authMiddleware, requireRole('admin'), upload.single('image'), addDoctor);
adminRouter.get('/dashboard', authMiddleware, requireRole('admin'), getAdminDashboard);
adminRouter.get('/doctors', authMiddleware, requireRole('admin'), getAllDoctorsAdmin);
adminRouter.delete('/doctor/:doctorId', authMiddleware, requireRole('admin'), deleteDoctor);
adminRouter.get('/appointments', authMiddleware, requireRole('admin'), getAllAppointmentsAdmin);
adminRouter.put('/appointment/:appointmentId', authMiddleware, requireRole('admin'), cancelAdminAppointment);

export default adminRouter;
