import 'dotenv/config.js'
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import cors from 'cors';
import adminRouter from './routes/adminRoute.js';
import userRouter from './routes/userRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import appointmentRouter from './routes/appointmentRoute.js';
import razorpayRouter from './routes/razorpayRoute.js';

const app = express();

// CORS — allow all known frontend domains + local dev
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://doctors-appointment-web-app.vercel.app',
    'https://doctors-appointment-web-app-ck6v.vercel.app',
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Shared DB connection — reused across warm invocations
let conn = null;
async function ensureDB() {
    if (mongoose.connection.readyState >= 1) return;
    if (!conn) {
        const uri = process.env.MONGODB_URI?.trim();
        if (!uri) throw new Error('MONGODB_URI is not set');
        conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
    }
    return conn;
}

// DB middleware — runs before every request
app.use(async (req, res, next) => {
    try { await ensureDB(); next(); }
    catch (e) { res.status(500).json({ success: false, message: 'DB connection failed: ' + e.message }); }
})

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        db: mongoose.connection.readyState >= 1,
        mongo: !!process.env.MONGODB_URI,
        cloud: !!process.env.CLOUDINARY_NAME,
    })
})

app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/appointment', appointmentRouter)
app.use('/api/razorpay', razorpayRouter)

app.get('/', (req, res) => {
    res.send('server running')
})

module.exports = app