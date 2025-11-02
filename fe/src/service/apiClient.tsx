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
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        (config) => {
            if (typeof window !== 'undefined') {
                // SỬA LỖI Ở ĐÂY: Đọc đúng key là 'accessToken'
                const token = localStorage.getItem('accessToken');

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log("✅ [apiClient] Đã tìm thấy và gắn token 'accessToken'");
                } else {
                    console.warn("⚠️ [apiClient] Không tìm thấy 'accessToken' trong localStorage.");
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                console.error("⛔ [apiClient] Lỗi 401 Unauthorized. Có thể token đã hết hạn hoặc không hợp lệ.");
                if (typeof window !== 'undefined') {
                    // SỬA LỖI Ở ĐÂY: Xóa đúng key là 'accessToken'
                    localStorage.removeItem('accessToken');
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

const apiClient = createAxiosInstance();

export default apiClient;