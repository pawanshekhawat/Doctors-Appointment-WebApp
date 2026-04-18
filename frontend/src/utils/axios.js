import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const message = error.response?.data?.message || 'Something went wrong';

            if (status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');
                localStorage.removeItem('doctorId');
                toast.error('Session expired. Please login again.');
                window.location.href = '/login';
            } else if (status === 403) {
                toast.error('Access denied. You do not have permission.');
            } else if (status === 404) {
                toast.error('Resource not found.');
            } else if (status >= 500) {
                toast.error('Server error. Please try again later.');
            }
        } else if (error.request) {
            toast.error('Unable to connect to server. Check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;