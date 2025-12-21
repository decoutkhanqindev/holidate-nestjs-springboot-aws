// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_URLS, markProductionDown } from '@/config/api.config';
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 65000,
        withCredentials: true, // QUAN TRỌNG: Cho phép gửi cookies (cần thiết cho OAuth)
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('accessToken');
                const url = config.url || '';


                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error: AxiosError) => {
            const url = error.config?.url || '';
            const status = error.response?.status;
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _fallbackRetry?: boolean };


            if (
                !originalRequest._fallbackRetry && // Chưa retry fallback
                originalRequest.baseURL === API_URLS.PRODUCTION && // Đang dùng production
                typeof window !== 'undefined' && // Chỉ ở client-side
                (
                    !error.response || // Network error (không có response)
                    error.code === 'ECONNABORTED' || // Timeout
                    error.code === 'ERR_NETWORK' || // Network error
                    status === 500 || // Server error
                    status === 502 || // Bad gateway
                    status === 503 || // Service unavailable
                    status === 504 // Gateway timeout
                )
            ) {
                markProductionDown();

                // Retry với local API
                originalRequest._fallbackRetry = true;
                originalRequest.baseURL = API_URLS.LOCAL;

                try {
                    return await axios(originalRequest);
                } catch (fallbackError) {
                    return Promise.reject(error);
                }
            }

            // ============================================
            // XỬ LÝ LỖI 401 (Unauthorized)
            // ============================================
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

    return instance;
};

const apiClient = createAxiosInstance();

export default apiClient;