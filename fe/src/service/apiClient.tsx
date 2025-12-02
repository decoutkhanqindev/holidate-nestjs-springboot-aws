// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_URLS, markProductionDown } from '@/config/api.config';
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

const createAxiosInstance = (): AxiosInstance => {
    // Validate API_BASE_URL không phải UUID hoặc undefined
    if (!API_BASE_URL || API_BASE_URL.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('[API Client] ❌ API_BASE_URL không hợp lệ:', API_BASE_URL);
        throw new Error(`API_BASE_URL không hợp lệ: ${API_BASE_URL}`);
    }

    if (typeof window !== 'undefined') {
        console.log('[API Client] Đang khởi tạo với baseURL:', API_BASE_URL);
    }

    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 15000, // Giảm từ 65s xuống 15s để tránh chờ quá lâu
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
                const fullUrl = `${config.baseURL || API_BASE_URL}${url}`;

                // Validate URL không chứa UUID làm baseURL
                if (config.baseURL && config.baseURL.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    console.error('[API Client] ❌ baseURL là UUID, không hợp lệ:', config.baseURL);
                    return Promise.reject(new Error(`Invalid baseURL: ${config.baseURL}`));
                }

                // Validate URL không chứa undefined/null
                if (url.includes('undefined') || url.includes('null')) {
                    console.error('[API Client] ❌ URL chứa undefined/null:', fullUrl);
                    return Promise.reject(new Error(`Invalid URL contains undefined/null: ${fullUrl}`));
                }

                console.log(`[API Client] Request: ${config.method?.toUpperCase()} ${fullUrl}`);

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