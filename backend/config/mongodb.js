import mongoose from 'mongoose';
import dns from 'dns';

// Force DNS to use Google DNS (8.8.8.8) to bypass ISP blocking
dns.setServers(['8.8.8.8']);

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database Connected'));
    await mongoose.connect(process.env.MONGODB_URI);
}

export default connectDB;
