import mongoose from 'mongoose';

let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export default async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        const uri = process.env.MONGODB_URI?.trim();
        if (!uri) throw new Error('MONGODB_URI is not set');

        mongoose.connection.on('connected', () => console.log('DB Connected'));
        mongoose.connection.on('error', (err) => console.error('DB Error:', err.message));

        cached.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        }).then((conn) => { cached.conn = conn; return conn; });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Also expose at module level for convenience
export async function getDB() {
    return connectDB();
}