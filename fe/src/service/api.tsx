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
        // Log request cho logout
        if (config.url?.includes('/auth/logout')) {
            console.log("[apiClient] 🔴 LOGOUT REQUEST INTERCEPTOR");
            console.log("[apiClient] - URL:", config.url);
            console.log("[apiClient] - Method:", config.method);
            console.log("[apiClient] - Data:", config.data);
            console.log("[apiClient] - withCredentials:", config.withCredentials);
        }
        
        // Log request cho /auth/me
        if (config.url?.includes('/auth/me')) {
            console.log("[apiClient] 📋 /auth/me REQUEST INTERCEPTOR");
            console.log("[apiClient] - URL:", config.url);
            console.log("[apiClient] - withCredentials:", config.withCredentials);
            const token = localStorage.getItem('accessToken');
            const isOAuthLogin = typeof window !== 'undefined' && sessionStorage.getItem('oauthLoginInProgress') === 'true';
            console.log("[apiClient] - Token trong localStorage:", token ? "CÓ" : "KHÔNG CÓ");
            console.log("[apiClient] - Đang OAuth login:", isOAuthLogin ? "CÓ" : "KHÔNG");
            console.log("[apiClient] - Lưu ý: /auth/me có thể dùng cookie (OAuth), không cần Authorization header");
            if (isOAuthLogin) {
                console.log("[apiClient] ⚠️ ĐANG OAUTH LOGIN - KHÔNG gửi Authorization header, chỉ dùng cookie");
            }
        }
        
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
                console.log("[apiClient] 🔵 /auth/me: Đang OAuth login, KHÔNG gửi Authorization header (chỉ dùng cookie)");
                // Xóa Authorization header nếu có
                if (config.headers['Authorization']) {
                    delete config.headers['Authorization'];
                }
                return config;
            }
            
            // Vẫn có thể gắn token nếu có (cho trường hợp email login)
            const token = localStorage.getItem('accessToken');
            if (token && !config.url.includes('/login') && !config.url.includes('/register')) {
                config.headers['Authorization'] = `Bearer ${token}`;
                console.log("[apiClient] - Đã gắn token vào Authorization header cho:", config.url);
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
        // Log response cho logout
        if (response.config.url?.includes('/auth/logout')) {
            console.log("[apiClient] ✅ LOGOUT RESPONSE INTERCEPTOR");
            console.log("[apiClient] - Status:", response.status);
            console.log("[apiClient] - StatusText:", response.statusText);
            console.log("[apiClient] - Data:", response.data);
            console.log("[apiClient] - Headers:", response.headers);
        }
        return response;
    },
    (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;
        
        // Log error cho logout
        if (url.includes('/auth/logout')) {
            console.error("[apiClient] ❌ LOGOUT ERROR INTERCEPTOR");
            console.error("[apiClient] - Error:", error);
            console.error("[apiClient] - Response:", error.response);
            console.error("[apiClient] - Status:", status);
            console.error("[apiClient] - Data:", error.response?.data);
        }
        
        // Xử lý lỗi 401
        if (status === 401) {
            console.error("⛔ [apiClient] Lỗi 401 Unauthorized");
            console.error("[apiClient] - URL:", url);
            console.error("[apiClient] - Có phải endpoint /auth/*:", url.startsWith('/auth/'));
            
            // QUAN TRỌNG: Không xóa token cho các endpoint /auth/*
            // Vì có thể đang dùng OAuth cookie, không cần token trong localStorage
            if (!url.startsWith('/auth/')) {
                console.warn("[apiClient] - Xóa token khỏi localStorage (không phải endpoint /auth/*)");
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            } else {
                console.log("[apiClient] - Không xóa token (endpoint /auth/* - có thể dùng OAuth cookie)");
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;