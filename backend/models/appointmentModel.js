import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    docId: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor', required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    amount: { type: Number, required: true },
    payment: { type: Boolean, default: false },
    cancelled: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    date: { type: Number, default: Date.now },
});

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;