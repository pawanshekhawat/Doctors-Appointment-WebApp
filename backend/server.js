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

// app config
const app = express()
const port = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/appointment', appointmentRouter)
app.use('/api/razorpay', razorpayRouter)

app.get('/', (req, res) => {
    res.send('server running')
}) 

const startServer = async () => {
    try {
        await connectDB()
        await connectCloudinary()

        app.listen(port, () => {
            console.log(`server is listening to ${port}`)
        })
    } catch (error) {
        console.error('Server startup failed:', error.message)
        process.exit(1)
    }
}

startServer()
