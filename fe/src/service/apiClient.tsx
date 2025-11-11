// src/service/apiClient.ts

import axios, { AxiosInstance, AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

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

                // Log chi tiết cho mọi request
                console.log("===========================================");
                console.log("📤 [apiClient] REQUEST INTERCEPTOR");
                console.log("===========================================");
                console.log("[apiClient] - URL:", url);
                console.log("[apiClient] - Method:", config.method?.toUpperCase());
                console.log("[apiClient] - withCredentials:", config.withCredentials);
                console.log("[apiClient] - Token trong localStorage:", token ? `CÓ (${token.substring(0, 20)}...)` : "KHÔNG CÓ");

                // QUAN TRỌNG: Với các endpoint không phải /auth/*, LUÔN cần Authorization header
                // Nếu không có token trong localStorage, có thể là OAuth - token nằm trong cookie
                // Backend sẽ tự động đọc từ cookie nếu có withCredentials: true
                // NHƯNG một số endpoint có thể yêu cầu cả Authorization header

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log("[apiClient] - ✅ Đã gắn token vào Authorization header");
                    console.log("[apiClient] - Authorization header:", `Bearer ${token.substring(0, 20)}...`);
                } else {
                    // Không có token trong localStorage
                    // Với OAuth, token nằm trong cookie
                    // Backend có thể đọc từ cookie, nhưng một số endpoint yêu cầu Authorization header
                    console.warn("[apiClient] - ⚠️ Không có token trong localStorage");

                    // Với endpoint không phải /auth/*, cần token trong Authorization header
                    if (!url.startsWith('/auth/')) {
                        console.warn("[apiClient] - ⚠️ Endpoint không phải /auth/* nhưng không có token trong localStorage");
                        console.warn("[apiClient] - ⚠️ Backend có thể yêu cầu Authorization header");
                        console.warn("[apiClient] - ⚠️ Request có thể bị 401 nếu backend không đọc được cookie");
                    } else {
                        console.log("[apiClient] - ✅ Endpoint /auth/* - có thể dùng cookie (OAuth)");
                    }
                }

                const authHeader = config.headers.Authorization;
                console.log("[apiClient] - Headers:", {
                    ...Object.fromEntries(Object.entries(config.headers)),
                    Authorization: authHeader ? (typeof authHeader === 'string' ? `${authHeader.substring(0, 30)}...` : 'CÓ (không phải string)') : 'KHÔNG CÓ'
                });
                console.log("===========================================");
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => {
            // Log response thành công
            const url = response.config.url || '';
            console.log("===========================================");
            console.log("✅ [apiClient] RESPONSE SUCCESS");
            console.log("===========================================");
            console.log("[apiClient] - URL:", url);
            console.log("[apiClient] - Status:", response.status);
            console.log("[apiClient] - StatusText:", response.statusText);
            console.log("===========================================");
            return response;
        },
        (error: AxiosError) => {
            const url = error.config?.url || '';
            const status = error.response?.status;
            const requestHeaders = error.config?.headers || {};
            const authHeader = (requestHeaders as any)?.Authorization || (error.config?.headers as any)?.Authorization;

            console.error("===========================================");
            console.error("❌ [apiClient] RESPONSE ERROR");
            console.error("===========================================");
            console.error("[apiClient] - URL:", url);
            console.error("[apiClient] - Method:", error.config?.method?.toUpperCase());
            console.error("[apiClient] - Status:", status);
            console.error("[apiClient] - StatusText:", error.response?.statusText);
            console.error("[apiClient] - Có phải endpoint /auth/*:", url.startsWith('/auth/'));

            // Log request headers
            console.error("[apiClient] - Request Headers:");
            const authHeaderStr = typeof authHeader === 'string' ? authHeader : (authHeader ? 'CÓ (không phải string)' : 'KHÔNG CÓ');
            console.error("  - Authorization:", authHeaderStr ? (typeof authHeaderStr === 'string' ? `${authHeaderStr.substring(0, 30)}...` : authHeaderStr) : 'KHÔNG CÓ');
            console.error("  - withCredentials:", error.config?.withCredentials);

            // Log response data từ backend
            if (error.response) {
                console.error("[apiClient] - Response Data từ Backend:", error.response.data);
                console.error("[apiClient] - Response Headers:", error.response.headers);
            } else {
                console.error("[apiClient] - ⚠️ Không có response từ backend (có thể là network error)");
            }

            // Log error message
            console.error("[apiClient] - Error Message:", error.message);
            console.error("[apiClient] - Error Code:", error.code);

            if (status === 401) {
                console.error("===========================================");
                console.error("🔴 [apiClient] PHÂN TÍCH LỖI 401:");
                console.error("===========================================");

                const tokenInStorage = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                const hasAuthHeader = !!authHeader;
                const authHeaderValue = typeof authHeader === 'string' ? authHeader : String(authHeader);

                console.error("[apiClient] - URL bị lỗi:", url);
                console.error("[apiClient] - Token trong localStorage:", tokenInStorage ? `CÓ (${tokenInStorage.substring(0, 20)}...)` : "KHÔNG CÓ");
                console.error("[apiClient] - Token đã được gửi trong Authorization header:", hasAuthHeader ? "CÓ" : "KHÔNG CÓ");

                if (hasAuthHeader) {
                    console.error("[apiClient] - Authorization header value:", authHeaderValue.substring(0, 50) + "...");
                    // Kiểm tra xem token có phải từ localStorage không
                    if (tokenInStorage && authHeaderValue.includes(tokenInStorage.substring(0, 20))) {
                        console.error("[apiClient] - ✅ Token trong header KHỚP với token trong localStorage");
                    } else if (!tokenInStorage) {
                        console.error("[apiClient] - ⚠️ Token trong header KHÔNG có trong localStorage");
                        console.error("[apiClient] - ⚠️ Token có thể được lấy từ cookie hoặc nguồn khác");
                    }

                    // Decode JWT token để kiểm tra thông tin
                    console.error("===========================================");
                    console.error("🔍 [apiClient] BẮT ĐẦU DECODE JWT TOKEN");
                    console.error("===========================================");
                    console.error("[apiClient] - authHeaderValue type:", typeof authHeaderValue);
                    console.error("[apiClient] - authHeaderValue length:", authHeaderValue.length);

                    try {
                        // Extract token từ "Bearer {token}"
                        let token = '';
                        if (typeof authHeaderValue === 'string') {
                            const tokenMatch = authHeaderValue.match(/Bearer\s+(.+)/);
                            if (tokenMatch && tokenMatch[1]) {
                                token = tokenMatch[1];
                                console.error("[apiClient] - ✅ Đã extract token từ Authorization header");
                            } else {
                                // Có thể token đã là token rồi, không có "Bearer "
                                token = authHeaderValue.replace(/^Bearer\s+/i, '');
                                console.error("[apiClient] - ✅ Đã extract token (không có Bearer prefix)");
                            }
                        } else {
                            token = String(authHeaderValue).replace(/^Bearer\s+/i, '');
                            console.error("[apiClient] - ✅ Đã convert và extract token");
                        }

                        console.error("[apiClient] - Token length:", token.length);
                        console.error("[apiClient] - Token preview:", token.substring(0, 50) + "...");

                        if (token && token.length > 10) {
                            const decoded = jwtDecode<any>(token);

                            console.error("===========================================");
                            console.error("🔍 [apiClient] DECODE JWT TOKEN THÀNH CÔNG:");
                            console.error("===========================================");
                            console.error("[apiClient] - Token payload:", JSON.stringify(decoded, null, 2));
                            console.error("[apiClient] - Subject (email):", decoded.sub);
                            console.error("[apiClient] - Full Name:", decoded.fullName);
                            console.error("[apiClient] - Role:", decoded.role || decoded.scope);
                            console.error("[apiClient] - Issuer:", decoded.iss);
                            console.error("[apiClient] - JWT ID:", decoded.jti);

                            // Kiểm tra thời gian hết hạn
                            if (decoded.exp) {
                                const expDate = new Date(decoded.exp * 1000);
                                const now = new Date();
                                const isExpired = now > expDate;
                                const timeUntilExpiry = expDate.getTime() - now.getTime();
                                const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);

                                console.error("[apiClient] - Expiration Time (exp):", expDate.toISOString());
                                console.error("[apiClient] - Current Time:", now.toISOString());
                                console.error("[apiClient] - Token đã hết hạn:", isExpired ? "✅ CÓ (ĐÂY LÀ NGUYÊN NHÂN!)" : "❌ CHƯA");

                                if (isExpired) {
                                    const expiredMinutes = Math.floor((now.getTime() - expDate.getTime()) / 1000 / 60);
                                    console.error("[apiClient] - ⚠️ Token đã hết hạn", expiredMinutes, "phút trước");
                                    console.error("[apiClient] - ⚠️ ĐÂY LÀ NGUYÊN NHÂN CHÍNH CỦA LỖI 401!");
                                    console.error("[apiClient] - 💡 GIẢI PHÁP: Cần login lại để lấy token mới");
                                } else {
                                    console.error("[apiClient] - ✅ Token còn hiệu lực", minutesUntilExpiry, "phút nữa");
                                    console.error("[apiClient] - ⚠️ Token chưa hết hạn nhưng vẫn bị 401");
                                    console.error("[apiClient] - ⚠️ Có thể là:");
                                    console.error("    1. Backend không nhận được token (CORS, header không đúng)");
                                    console.error("    2. Token signature không hợp lệ");
                                    console.error("    3. Backend security filter từ chối token");
                                    console.error("    4. Backend yêu cầu cookie nhưng cookie đã hết hạn");
                                }
                            } else {
                                console.error("[apiClient] - ⚠️ Token không có trường 'exp' (expiration time)");
                                console.error("[apiClient] - ⚠️ Token có thể không hợp lệ");
                            }

                            // Kiểm tra thời gian phát hành
                            if (decoded.iat) {
                                const iatDate = new Date(decoded.iat * 1000);
                                const nowForIat = new Date();
                                console.error("[apiClient] - Issued At (iat):", iatDate.toISOString());
                                const ageMinutes = Math.floor((nowForIat.getTime() - iatDate.getTime()) / 1000 / 60);
                                console.error("[apiClient] - Token age:", ageMinutes, "phút");
                            }

                            console.error("===========================================");
                        } else {
                            console.error("[apiClient] - ❌ Token quá ngắn hoặc không hợp lệ");
                            console.error("[apiClient] - Token:", token);
                        }
                    } catch (decodeError: any) {
                        console.error("[apiClient] - ❌ LỖI KHI DECODE JWT TOKEN:");
                        console.error("[apiClient] - Error:", decodeError);
                        console.error("[apiClient] - Error message:", decodeError.message);
                        console.error("[apiClient] - Error stack:", decodeError.stack);
                        console.error("[apiClient] - ⚠️ Token có thể không phải là JWT hợp lệ");
                        console.error("[apiClient] - ⚠️ Hoặc token format không đúng");
                    }
                } else {
                    console.error("[apiClient] - ⚠️ Không có Authorization header để decode");
                }

                console.error("[apiClient] - withCredentials:", error.config?.withCredentials ? "CÓ" : "KHÔNG CÓ");

                // Log response data từ backend
                if (error.response?.data) {
                    console.error("[apiClient] - Response Data từ Backend:", JSON.stringify(error.response.data, null, 2));
                }

                // Phân tích nguyên nhân
                if (!tokenInStorage && !hasAuthHeader) {
                    console.error("[apiClient] - ⚠️ NGUYÊN NHÂN: Không có token trong localStorage VÀ không có Authorization header");
                    console.error("[apiClient] - ⚠️ Có thể là OAuth session - cần cookie (với withCredentials: true)");
                } else if (tokenInStorage && !hasAuthHeader) {
                    console.error("[apiClient] - ⚠️ NGUYÊN NHÂN: Có token trong localStorage NHƯNG không được gắn vào Authorization header");
                    console.error("[apiClient] - ⚠️ Lỗi ở frontend - interceptor không hoạt động đúng");
                } else if (hasAuthHeader) {
                    console.error("[apiClient] - ⚠️ NGUYÊN NHÂN: Có Authorization header NHƯNG backend trả về 401");
                    console.error("[apiClient] - ⚠️ ĐÂY LÀ LỖI Ở BACKEND HOẶC TOKEN KHÔNG HỢP LỆ");
                    console.error("[apiClient] - ⚠️ Có thể là:");
                    console.error("    1. ✅ Token đã hết hạn (kiểm tra expiresAt trong token)");
                    console.error("    2. ✅ Token không hợp lệ (format sai, signature sai)");
                    console.error("    3. ✅ Backend không nhận được token đúng cách");
                    console.error("    4. ✅ Backend yêu cầu cookie nhưng cookie đã hết hạn");
                    console.error("    5. ✅ Backend security filter không cho phép token này");

                    // Gợi ý fix
                    console.error("[apiClient] - 💡 GỢI Ý FIX:");
                    console.error("    1. Kiểm tra backend log để xem token có được nhận không");
                    console.error("    2. Kiểm tra token có hết hạn không (decode JWT và xem exp)");
                    console.error("    3. Thử login lại để lấy token mới");
                    console.error("    4. Kiểm tra backend security config có đúng không");
                }

                console.error("===========================================");

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

            console.error("===========================================");
            return Promise.reject(error);
        }
    );

    return instance;
};

const apiClient = createAxiosInstance();

export default apiClient;