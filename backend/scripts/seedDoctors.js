import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import dns from 'dns';
dns.setServers(['8.8.8.8']);
import doctorModel from '../models/doctorModel.js';
import bcrypt from 'bcrypt';

const doctors = [
    { name: 'Dr. Richard James', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc1', speciality: 'General physician', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Emily Larson', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc2', speciality: 'Gynecologist', degree: 'MBBS', experience: '3 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 60, address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Sarah Patel', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc3', speciality: 'Dermatologist', degree: 'MBBS', experience: '1 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 30, address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Christopher Lee', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc4', speciality: 'Pediatricians', degree: 'MBBS', experience: '2 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 40, address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Jennifer Garcia', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc5', speciality: 'Neurologist', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Andrew Williams', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc6', speciality: 'Neurologist', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Christopher Davis', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc7', speciality: 'General physician', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Timothy White', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc8', speciality: 'Gynecologist', degree: 'MBBS', experience: '3 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 60, address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Ava Mitchell', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc9', speciality: 'Dermatologist', degree: 'MBBS', experience: '1 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 30, address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Jeffrey King', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc10', speciality: 'Pediatricians', degree: 'MBBS', experience: '2 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 40, address: { line1: '47th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Zoe Kelly', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc11', speciality: 'Neurologist', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Patrick Harris', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc12', speciality: 'Neurologist', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '57th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Chloe Evans', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc13', speciality: 'General physician', degree: 'MBBS', experience: '4 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 50, address: { line1: '17th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Ryan Martinez', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc14', speciality: 'Gynecologist', degree: 'MBBS', experience: '3 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 60, address: { line1: '27th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
    { name: 'Dr. Amelia Hill', image: 'https://res.cloudinary.com/dmqwd5jcq/image/upload/v1/doctors/doc15', speciality: 'Dermatologist', degree: 'MBBS', experience: '1 Years', about: 'Dr. Davis has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.', fees: 30, address: { line1: '37th Cross, Richmond', line2: 'Circle, Ring Road, London' } },
];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await doctorModel.deleteMany({});
        console.log('Cleared existing doctors');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('doctor123', salt);

        const doctorsWithPassword = doctors.map((doc, i) => ({
            ...doc,
            email: `doctor${i + 1}@prescripto.com`,
            password: hashedPassword,
            available: true,
            date: Date.now(),
            slots_booked: {},
        }));

        await doctorModel.insertMany(doctorsWithPassword);
        console.log(`✅ Seeded ${doctors.length} doctors successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
};

seedDoctors();
