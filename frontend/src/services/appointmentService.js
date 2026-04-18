import api from '../utils/axios.js';

export const appointmentService = {
    bookAppointment: (data) => api.post('/api/appointment/book', data),
    getUserAppointments: () => api.get('/api/appointment/user-appointments'),
    cancelAppointment: (appointmentId) =>
        api.put(`/api/appointment/cancel/${appointmentId}`),
    getDoctorAppointments: () => api.get('/api/appointment/doctor-appointments'),
    cancelByDoctor: (appointmentId) =>
        api.put(`/api/appointment/cancel-by-doctor/${appointmentId}`),
    completeAppointment: (appointmentId) =>
        api.put(`/api/appointment/complete/${appointmentId}`),
    createOrder: (appointmentId) =>
        api.post('/api/razorpay/create-order', { appointmentId }),
    verifyPayment: (data) =>
        api.put('/api/razorpay/verify-payment', data),
};

export default appointmentService;
