//  services/api.ts

import axios from 'axios';
import { API_BASE_URL } from '@/config/api.config';

export { API_BASE_URL };


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});


apiClient.interceptors.request.use(
    (config) => {

        // Với các endpoint /auth/*, không gắn Authorization header
        // Vì:
        // - /auth/login, /auth/register: không cần token
        // - /auth/me: có thể dùng cookie (OAuth) hoặc Authorization header
        //   NHƯNG: Nếu đang OAuth login, CHỈ dùng cookie, không gửi Authorization header
        // - /auth/logout: cần token trong body, không cần Authorization header
        if (config.url?.startsWith('/auth/')) {
            // Kiểm tra xem có đang OAuth login không
            const isOAuthLogin = typeof window !== 'undefined' && sessionStorage.getItem('oauthLoginInProgress') === 'true';

            // Với /auth/me, nếu đang OAuth login, KHÔNG gửi Authorization header (chỉ dùng cookie)
            if (config.url.includes('/auth/me') && isOAuthLogin) {
                if (config.headers['Authorization']) {
                    delete config.headers['Authorization'];
                }
                return config;
            }

            // Vẫn có thể gắn token nếu có (cho trường hợp email login)
            const token = localStorage.getItem('accessToken');
            if (token && !config.url.includes('/login') && !config.url.includes('/register')) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
        }

        // Với các endpoint khác, luôn gắn token nếu có
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

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;

        // Xử lý lỗi 401
        if (status === 401) {
            // QUAN TRỌNG: Không xóa token cho các endpoint /auth/*
            // Vì có thể đang dùng OAuth cookie, không cần token trong localStorage
            if (!url.startsWith('/auth/')) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;