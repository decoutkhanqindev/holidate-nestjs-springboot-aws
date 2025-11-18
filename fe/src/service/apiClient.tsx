// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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

                // QUAN TRỌNG: Với các endpoint không phải /auth/*, LUÔN cần Authorization header
                // Nếu không có token trong localStorage, có thể là OAuth - token nằm trong cookie
                // Backend sẽ tự động đọc từ cookie nếu có withCredentials: true
                // NHƯNG một số endpoint có thể yêu cầu cả Authorization header

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
        (error: AxiosError) => {
            const url = error.config?.url || '';
            const status = error.response?.status;

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