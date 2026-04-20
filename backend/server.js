import 'dotenv/config.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import connectDB from './config/mongodb.js'
import adminRouter from './routes/adminRoute.js'
import userRouter from './routes/userRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import appointmentRouter from './routes/appointmentRoute.js'
import razorpayRouter from './routes/razorpayRoute.js'

const app = express()

// CORS — explicit whitelist
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://doctors-appointment-web-app.vercel.app',
        'https://doctors-appointment-web-app-ck6v.vercel.app',
    ],
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/', (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState >= 1 })
})

// Routes
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/appointment', appointmentRouter)
app.use('/api/razorpay', razorpayRouter)

// Express error handler — never crashes the function
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message)
    res.status(err.status || 500).json({ success: false, message: err.message })
})

await connectDB()

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 4000
    app.listen(PORT, () => console.log(`Server on port ${PORT}`))
}

export default app
