import validator from "validator"
import jwt from "jsonwebtoken"
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"

// Generate JWT for admin
const generateAdminToken = (id) => {
    return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Hardcoded admin credentials from .env
// ADMIN_EMAIL and ADMIN_PASSWORD in .env

// POST /api/admin/login
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.json({ success: false, message: 'Email and password are required' })
        }

        const cleanEmail = String(email).trim().toLowerCase()
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@prescripto.com'
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

        if (cleanEmail !== adminEmail) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }

        // Direct comparison for hardcoded admin (no bcrypt needed)
        if (password !== adminPassword) {
            return res.json({ success: false, message: 'Invalid email or password' })
        }

        // For simplicity, use a static admin ID
        const token = jwt.sign(
            { id: 'admin-id', role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: 'admin-id',
                    email: adminEmail,
                    name: 'Admin',
                },
            },
        })
    } catch (error) {
        console.log('Admin login error:', error)
        res.json({ success: false, message: error.message })
    }
}

// API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address, image } = req.body
        const imageFile = req.file
        const cleanEmail = String(email || "").trim().toLowerCase()

        console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile);

        if (!name || !cleanEmail || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(cleanEmail)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        let imageUrl = image || "https://via.placeholder.com/300x300.png?text=Doctor"
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            imageUrl = imageUpload.secure_url
        }

        let parsedAddress = address
        try {
            parsedAddress = typeof address === "string" ? JSON.parse(address) : address
        } catch {
            parsedAddress = { line1: String(address || ""), line2: "" }
        }

        const doctorData = {
            name,
            email: cleanEmail,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: parsedAddress,
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({ success: true, message: "Doctor Added" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor, loginAdmin }
