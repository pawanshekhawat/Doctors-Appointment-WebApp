import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import doctorModel from '../models/doctorModel.js';

// Generate JWT token
const generateToken = (id, role = 'doctor') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/doctor/login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        const doctor = await doctorModel.findOne({ email: cleanEmail });
        if (!doctor) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(doctor._id, 'doctor');

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                doctor: {
                    id: doctor._id,
                    name: doctor.name,
                    email: doctor.email,
                    image: doctor.image,
                    speciality: doctor.speciality,
                    degree: doctor.degree,
                    experience: doctor.experience,
                    about: doctor.about,
                    fees: doctor.fees,
                    available: doctor.available,
                    address: doctor.address,
                },
            },
        });
    } catch (error) {
        console.log('Doctor login error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/doctor/get-profile
const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.userId).select('-password');
        if (!doctor) {
            return res.json({ success: false, message: 'Doctor not found' });
        }

        res.json({ success: true, data: { doctor } });
    } catch (error) {
        console.log('Get doctor profile error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/doctor/update-profile
const updateDoctorProfile = async (req, res) => {
    try {
        const { name, about, fees, address, available } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (about) updateData.about = about;
        if (fees) updateData.fees = fees;
        if (address) {
            updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
        }
        if (available !== undefined) updateData.available = available;

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Profile updated', data: { doctor: updatedDoctor } });
    } catch (error) {
        console.log('Update doctor profile error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { loginDoctor, getDoctorProfile, updateDoctorProfile };
