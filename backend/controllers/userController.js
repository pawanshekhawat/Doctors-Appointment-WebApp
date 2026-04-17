import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Generate JWT token
const generateToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/user/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        if (!validator.isEmail(cleanEmail)) {
            return res.json({ success: false, message: 'Please enter a valid email' });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: 'Password must be at least 8 characters' });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new userModel({
            name,
            email: cleanEmail,
            password: hashedPassword,
        });

        await newUser.save();

        const token = generateToken(newUser._id, 'user');

        res.json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    image: newUser.image,
                },
            },
        });
    } catch (error) {
        console.log('Register error:', error);
        res.json({ success: false, message: error.message });
    }
};

// POST /api/user/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' });
        }

        const cleanEmail = String(email).trim().toLowerCase();

        const user = await userModel.findOne({ email: cleanEmail });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id, 'user');

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    phone: user.phone,
                    gender: user.gender,
                    dob: user.dob,
                    address: user.address,
                },
            },
        });
    } catch (error) {
        console.log('Login error:', error);
        res.json({ success: false, message: error.message });
    }
};

// GET /api/user/get-profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: { user } });
    } catch (error) {
        console.log('Get profile error:', error);
        res.json({ success: false, message: error.message });
    }
};

// PUT /api/user/update-profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, gender, dob, address } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (gender) updateData.gender = gender;
        if (dob) updateData.dob = dob;
        if (address) {
            updateData.address = typeof address === 'string' ? JSON.parse(address) : address;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({ success: true, message: 'Profile updated', data: { user: updatedUser } });
    } catch (error) {
        console.log('Update profile error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { registerUser, loginUser, getUserProfile, updateUserProfile };
