import express from 'express'
import cors from 'cors'
import 'dotenv/config.js'
import connectDB from './config/mongodb.js'

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoint
app.get('/', (req, res) => {
    res.send('server running')
}) 

app.listen(port, ()=>{
    console.log(`server is listening to ${port}`)
})