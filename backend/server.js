import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import userRouter from './routes/userRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import appointmentRouter from './routes/appointmentRoute.js'
import razorpayRouter from './routes/razorpayRoute.js'

const app = express()

// CORS — allow Vercel frontend + local dev
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
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

app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/appointment', appointmentRouter)
app.use('/api/razorpay', razorpayRouter)

app.get('/', (req, res) => {
    res.send('server running')
})

// Only start server locally — Vercel uses module.exports
if (process.env.VERCEL !== '1') {
    const port = process.env.PORT || 4000
    const startServer = async () => {
        try {
            await connectDB()
            await connectCloudinary()
            app.listen(port, () => console.log(`server is listening to ${port}`))
        } catch (error) {
            console.error('Server startup failed:', error.message)
            process.exit(1)
        }
    }
    startServer()
}

module.exports = app