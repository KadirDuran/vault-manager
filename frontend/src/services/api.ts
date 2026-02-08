import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Extract useful error message
        const message = error.response?.data?.detail || error.response?.data?.error || error.message;
        console.error("API Error:", message);

        return Promise.reject(error.response?.data || error);
    }
);

export default api;
