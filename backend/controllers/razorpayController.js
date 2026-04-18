import Razorpay from 'razorpay';
import appointmentModel from '../models/appointmentModel.js';
import doctorModel from '../models/doctorModel.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.userId.toString() !== req.userId) {
            return res.json({ success: false, message: 'Not authorized' });
        }

        if (appointment.payment) {
            return res.json({ success: false, message: 'Already paid' });
        }

        const amount = appointment.amount * 100;

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `rcpt_${appointment._id}`,
            notes: {
                appointmentId: appointment._id.toString(),
                docId: appointment.docId.toString(),
            },
        });

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.log('Create order error:', error);
        res.json({ success: false, message: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const appointment = await appointmentModel.findById(appointmentId);
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' });
        }

        if (appointment.payment) {
            return res.json({ success: true, message: 'Already verified' });
        }

        const crypto = await import('crypto');
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.json({ success: false, message: 'Invalid payment signature' });
        }

        appointment.payment = true;
        appointment.razorpayOrderId = razorpay_order_id;
        appointment.razorpayPaymentId = razorpay_payment_id;
        appointment.razorpaySignature = razorpay_signature;
        await appointment.save();

        res.json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.log('Verify payment error:', error);
        res.json({ success: false, message: error.message });
    }
};

export { createOrder, verifyPayment };
