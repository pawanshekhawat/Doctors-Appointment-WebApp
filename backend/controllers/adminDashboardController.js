import doctorModel from '../models/doctorModel.js';
import userModel from '../models/userModel.js';
import appointmentModel from '../models/appointmentModel.js';

// GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
    try {
        const [doctors, users, appointments] = await Promise.all([
            doctorModel.find({}),
            userModel.find({}),
            appointmentModel.find({}).populate('docId').populate('userId'),
        ]);

        const latestAppointments = [...appointments]
            .sort((a, b) => b.date - a.date)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                doctors: doctors.length,
                patients: users.length,
                appointments: appointments.length,
                latestAppointments,
            },
        });
    } catch (error) {
        console.log('Admin dashboard error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/doctors
const getAllDoctorsAdmin = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password').sort({ date: -1 });

        res.json({ success: true, data: { doctors } });
    } catch (error) {
        console.log('Get all doctors admin error:', error);
        res.json({ success: false, message: error.message });
    }
};

// DELETE /api/admin/doctor/:doctorId
const deleteDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const deleted = await doctorModel.findByIdAndDelete(doctorId);
        if (!deleted) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        res.json({ success: true, message: 'Doctor deleted' });
    } catch (error) {
        console.log('Delete doctor error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/admin/appointments
const getAllAppointmentsAdmin = async (req, res) => {
    try {
        const appointments = await appointmentModel
            .find({})
            .populate('docId', 'name')
            .populate('userId', 'name email')
            .sort({ date: -1 });

        res.json({ success: true, data: { appointments } });
    } catch (error) {
        console.log('Get all appointments admin error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/admin/appointment/:appointmentId
const cancelAdminAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        appointment.cancelled = true;
        await appointment.save();

        await doctorModel.findByIdAndUpdate(appointment.docId, {
            $unset: { [`slots_booked.${appointment.slotDate}.${appointment.slotTime}`]: '' },
        });

        res.json({ success: true, message: 'Appointment cancelled by admin' });
    } catch (error) {
        console.log('Cancel admin appointment error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { getAdminDashboard, getAllDoctorsAdmin, deleteDoctor, getAllAppointmentsAdmin, cancelAdminAppointment };