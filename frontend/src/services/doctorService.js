import api from '../utils/axios.js';

export const doctorService = {
    // Public
    getDoctors: (speciality) =>
        api.get('/api/doctor/list', { params: { speciality } }),
    getDoctorById: (doctorId) =>
        api.get(`/api/doctor/${doctorId}`),
    getRelatedDoctors: (doctorId) =>
        api.get(`/api/doctor/related/${doctorId}`),

    // Doctor dashboard (protected)
    getDashboard: () => api.get('/api/doctor/dashboard'),
};

export default doctorService;
