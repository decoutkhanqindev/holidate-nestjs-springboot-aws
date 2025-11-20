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
                // 
                // LƯU Ý VỀ OAUTH:
                // - Khi login bằng Google OAuth, token được lưu vào cookie (JSESSIONID) bởi backend
                // - AuthContext.tsx sẽ tự động gọi getMyProfile() để lấy token từ cookie
                // - Token được lưu vào localStorage trong AuthContext.tsx → initializeAuth()
                // - Sau đó, apiClient này sẽ tự động thêm Authorization header từ localStorage
                // - Nếu không có token trong localStorage, có thể:
                //   1. Chưa login (bình thường)
                //   2. Đang trong quá trình OAuth redirect (token chưa được sync)
                //   3. Token bị xóa (cần login lại)

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    // Debug: Log khi không có token (trừ các endpoint /auth/*)
                    if (!url.startsWith('/auth/')) {
                        console.warn(`[apiClient] ⚠️ Không có token trong localStorage cho request: ${url}`);
                        console.warn(`[apiClient] - Nếu đây là OAuth flow, token có thể chưa được sync từ cookie`);
                        console.warn(`[apiClient] - AuthContext sẽ tự động sync token khi initializeAuth() chạy`);
                    }
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