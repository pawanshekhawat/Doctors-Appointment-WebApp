import doctorModel from '../models/doctorModel.js';

// GET /api/doctor/list
// Query params: ?speciality=Dermatologist (optional)
const getAllDoctors = async (req, res) => {
    try {
        const { speciality } = req.query;

        let query = { available: true };

        if (speciality && speciality !== 'All') {
            query.speciality = speciality;
        }

        const doctors = await doctorModel.find(query).select('-password -slots_booked');

        res.json({ success: true, data: { doctors } });
    } catch (error) {
        console.log('Get all doctors error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/doctor/:doctorId
const getDoctorById = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const doctor = await doctorModel.findById(doctorId).select('-password');

        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        res.json({ success: true, data: { doctor } });
    } catch (error) {
        console.log('Get doctor by ID error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/doctor/related/:doctorId
// Returns doctors with same speciality, excluding the given doctor
const getRelatedDoctors = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const targetDoctor = await doctorModel.findById(doctorId).select('speciality');
        if (!targetDoctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        const relatedDoctors = await doctorModel.find({
            speciality: targetDoctor.speciality,
            _id: { $ne: doctorId },
            available: true,
        })
        .select('-password -slots_booked')
        .limit(4);

        res.json({ success: true, data: { doctors: relatedDoctors } });
    } catch (error) {
        console.log('Get related doctors error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { getAllDoctors, getDoctorById, getRelatedDoctors };