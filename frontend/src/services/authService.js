import api from '../utils/axios.js';

export const authService = {
    // User auth
    register: (data) => api.post('/api/user/register', data),
    login: (data) => api.post('/api/user/login', data),

    // Doctor auth
    doctorLogin: (data) => api.post('/api/doctor/login', data),

    // Admin auth
    adminLogin: (data) => api.post('/api/admin/login', data),

    // User profile
    getProfile: () => api.get('/api/user/get-profile'),
    updateProfile: (data) => api.put('/api/user/update-profile', data),

    // Doctor profile
    getDoctorProfile: () => api.get('/api/doctor/get-profile'),
    updateDoctorProfile: (data) => api.put('/api/doctor/update-profile', data),
};

export default authService;
