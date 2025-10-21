//  services/api.ts

import axios from 'axios';


export const API_BASE_URL = 'http://localhost:8080';


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


apiClient.interceptors.request.use(
    (config) => {
        if (config.url?.startsWith('/auth/')) {
            return config;
        }

        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;