import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

// GET /api/doctor/dashboard
const getDoctorDashboard = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.userId).select('-password -slots_booked');
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        const appointments = await appointmentModel
            .find({ docId: req.userId })
            .populate('userId', 'name email phone gender dob')
            .sort({ date: -1 });

        const latestAppointments = appointments.slice(0, 5);

        // Calculate earnings (only paid + not cancelled)
        const earnings = appointments
            .filter(a => a.payment && !a.cancelled)
            .reduce((total, a) => total + a.amount, 0);

        res.json({
            success: true,
            data: {
                doctor,
                appointmentsCount: appointments.length,
                latestAppointments,
                earnings,
            },
        });
    } catch (error) {
        console.log('Doctor dashboard error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { getDoctorDashboard };