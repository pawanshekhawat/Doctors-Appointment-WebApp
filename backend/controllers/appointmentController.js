import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

// POST /api/appointment/book
const bookAppointment = async (req, res) => {
    try {
        const { docId, slotDate, slotTime, amount } = req.body;

        if (!docId || !slotDate || !slotTime || !amount) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        // Check if slot is already booked
        const existing = await appointmentModel.findOne({ docId, slotDate, slotTime, cancelled: false });
        if (existing) {
            return res.json({ success: false, message: 'Slot already booked' });
        }

        const appointment = new appointmentModel({
            userId: req.userId,
            docId,
            slotDate,
            slotTime,
            amount,
            payment: 'cash',
        });

        await appointment.save();

        // Update doctor's booked slots
        await doctorModel.findByIdAndUpdate(docId, {
            $set: { [`slots_booked.${slotDate}.${slotTime}`]: true },
        });

        res.json({ success: true, message: 'Appointment booked', data: { appointment } });
    } catch (error) {
        console.log('Book appointment error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/appointment/user-appointments
const getUserAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel
            .find({ userId: req.userId })
            .populate('docId', 'name image speciality')
            .sort({ date: -1 });

        res.json({ success: true, data: { appointments } });
    } catch (error) {
        console.log('Get user appointments error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/appointment/cancel/:appointmentId
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await appointmentModel.findOne({ _id: appointmentId, userId: req.userId });
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }
        if (appointment.cancelled) {
            return res.json({ success: false, message: 'Already cancelled' });
        }

        appointment.cancelled = true;
        await appointment.save();

        // Free up the slot in doctor's record
        await doctorModel.findByIdAndUpdate(appointment.docId, {
            $unset: { [`slots_booked.${appointment.slotDate}.${appointment.slotTime}`]: '' },
        });

        res.json({ success: true, message: 'Appointment cancelled' });
    } catch (error) {
        console.log('Cancel appointment error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/appointment/cancel-by-doctor/:appointmentId
const cancelByDoctor = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await appointmentModel.findOne({ _id: appointmentId, docId: req.userId });
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        appointment.cancelled = true;
        await appointment.save();

        await doctorModel.findByIdAndUpdate(appointment.docId, {
            $unset: { [`slots_booked.${appointment.slotDate}.${appointment.slotTime}`]: '' },
        });

        res.json({ success: true, message: 'Appointment cancelled by doctor' });
    } catch (error) {
        console.log('Cancel by doctor error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/appointment/doctor-appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await appointmentModel
            .find({ docId: req.userId })
            .populate('userId', 'name email phone gender dob')
            .sort({ date: -1 });

        res.json({ success: true, data: { appointments } });
    } catch (error) {
        console.log('Get doctor appointments error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/appointment/complete/:appointmentId
const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const appointment = await appointmentModel.findOneAndUpdate(
            { _id: appointmentId, docId: req.userId },
            { completed: true },
            { new: true }
        );

        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        res.json({ success: true, message: 'Appointment marked as complete' });
    } catch (error) {
        console.log('Complete appointment error:', error);
        res.json({ success: false, message: error.message });
    }
};

export {
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
    cancelByDoctor,
    getDoctorAppointments,
    completeAppointment,
};