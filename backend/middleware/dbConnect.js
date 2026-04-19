import connectDB from './mongodb.js';

export default async function ensureDB(req, res, next) {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.json({ success: false, message: 'Database connection failed: ' + error.message });
    }
}