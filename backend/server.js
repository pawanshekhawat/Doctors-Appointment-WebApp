import 'dotenv/config.js'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({
    origin: '*',
    credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.json({ ok: true, msg: 'server running', env: !!process.env.MONGODB_URI })
})

module.exports = app