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
};

export default appointmentService;
