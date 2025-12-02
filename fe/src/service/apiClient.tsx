// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '@/config/api.config';
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

const createAxiosInstance = (): AxiosInstance => {
    // Log URL đang dùng để debug
    if (typeof window !== 'undefined') {
        console.log('[API Client] Đang sử dụng API URL:', API_BASE_URL);
    }

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

                // Log request để debug
                console.log(`[API Client] Request: ${config.method?.toUpperCase()} ${config.baseURL}${url}`);

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
            // Log response thành công để debug
            if (typeof window !== 'undefined') {
                console.log(`[API Client] Response thành công: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                    status: response.status,
                    statusText: response.statusText,
                    hasData: !!response.data,
                    dataKeys: response.data ? Object.keys(response.data) : []
                });
            }
            return response;
        },
        async (error: AxiosError) => {
            const url = error.config?.url || '';
            const status = error.response?.status;

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

            // Log tất cả các lỗi để debug
            if (typeof window !== 'undefined') {
                console.error(`[API Client] Response lỗi: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
                    status: status,
                    statusText: error.response?.statusText,
                    message: error.message,
                    code: error.code,
                    responseData: error.response?.data,
                    baseURL: error.config?.baseURL
                });
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

const apiClient = createAxiosInstance();

export default apiClient;