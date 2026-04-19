import 'dotenv/config.js'
import mongoose from 'mongoose';
import doctorModel from './models/doctorModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

await mongoose.connect(process.env.MONGODB_URI);

const doctors = await doctorModel.find({}).select('name image').sort({ name: 1 });
console.log('All doctors in DB:');
doctors.forEach(d => console.log(' ', d.name, '|', d.image || 'NO IMAGE'));

// Map: exact DB doctor name → local image file (doc1.png = Dr. Richard James, etc.)
// Based on: DB names matched against assets.js doctor names + order
const nameToFile = {
    'Dr. Richard James':    'doc1.png',
    'Dr. Emily Larson':     'doc2.png',
    'Dr. Sarah Patel':       'doc3.png',  // assets.js uses Sarah Patel (DB has Sarah Patel too)
    'Dr. Christopher Lee':   'doc4.png',
    'Dr. Jennifer Garcia':   'doc5.png',
    'Dr. Andrew Williams':   'doc6.png',
    'Dr. Christopher Davis': 'doc7.png',
    'Dr. Timothy White':      'doc8.png',
    'Dr. Ava Mitchell':      'doc9.png',
    'Dr. Jeffrey King':      'doc10.png',
    'Dr. Zoe Kelly':        'doc11.png',
    'Dr. Patrick Harris':    'doc12.png',
    'Dr. Chloe Evans':       'doc13.png',
    'Dr. Ryan Martinez':     'doc14.png',
    'Dr. Amanda Garcia':     'doc15.png',
};

console.log('\nUploading images to Cloudinary...');
let uploaded = 0, skipped = 0, missing = 0;

for (const doctor of doctors) {
    // Skip test entries that don't have real doctor photos
    const testNames = ['Dr Test Added', 'Pay Doctor', 'Persist Doctor', 'Verify Doctor'];
    if (testNames.includes(doctor.name)) {
        console.log(`  [SKIP] ${doctor.name} — test entry`);
        skipped++;
        continue;
    }

    // If already has a real Cloudinary URL, skip
    if (doctor.image && doctor.image.includes('res.cloudinary.com')) {
        console.log(`  [SKIP] ${doctor.name} — already has Cloudinary URL`);
        skipped++;
        continue;
    }

    const imgFile = nameToFile[doctor.name];
    if (!imgFile) {
        console.log(`  [SKIP] ${doctor.name} — no image file mapped`);
        skipped++;
        continue;
    }

    const imgPath = path.join(__dirname, '../frontend/src/assets', imgFile);
    if (!fs.existsSync(imgPath)) {
        console.log(`  [MISSING] ${doctor.name} — file not found: ${imgFile}`);
        missing++;
        continue;
    }

    try {
        const result = await cloudinary.uploader.upload(imgPath, {
            folder: 'doctor-profiles',
            transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        });
        await doctorModel.findByIdAndUpdate(doctor._id, { image: result.secure_url });
        console.log(`  [OK] ${doctor.name} → ${imgFile}`);
        uploaded++;
    } catch (err) {
        console.log(`  [ERR] ${doctor.name} — ${err.message}`);
    }
}

console.log(`\nResult: ${uploaded} uploaded, ${skipped} skipped, ${missing} missing files`);
await mongoose.disconnect();
process.exit(0);