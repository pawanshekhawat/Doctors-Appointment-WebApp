import mongoose from 'mongoose';

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI?.trim().replace(/^['"]|['"]$/g, '');

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not configured');
    }

    mongoose.connection.on('connected', () => console.log('Database Connected'));
    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });

    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
    });
};

export default connectDB;
