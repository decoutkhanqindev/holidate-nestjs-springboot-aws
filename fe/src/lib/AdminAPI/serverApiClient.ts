// lib/AdminAPI/serverApiClient.ts
// Helper để tạo API client cho server actions (lấy token từ cookies)
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

/**
 * Tạo axios instance với token từ cookies (dùng trong server actions)
 * Lưu ý: Phải gọi cookies() bên trong function, không import ở top level
 */
export async function createServerApiClient(): Promise<AxiosInstance> {
    // Dynamic import để tránh lỗi khi bundle cho client
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies(); // Next.js 15+ requires await
    const token = cookieStore.get('accessToken')?.value;

    console.log("[serverApiClient] Token from cookies:", token ? `Found (length: ${token.length})` : 'Not found');
    console.log("[serverApiClient] All cookies:", Array.from(cookieStore.getAll()).map(c => ({ name: c.name, hasValue: !!c.value, valueLength: c.value?.length })));

    // Kiểm tra token trước khi tạo client
    if (!token) {
        console.error("[serverApiClient] Available cookie names:", Array.from(cookieStore.getAll()).map(c => c.name));
        throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
    }

    // Decode token để kiểm tra role (nếu có thể)
    try {
        const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log("[serverApiClient] Token payload:", {
            sub: jwtPayload.sub,
            role: jwtPayload.role || jwtPayload.scope,
            exp: jwtPayload.exp ? new Date(jwtPayload.exp * 1000).toISOString() : 'N/A',
            isExpired: jwtPayload.exp ? Date.now() > jwtPayload.exp * 1000 : 'N/A'
        });
    } catch (e) {
    }


    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 65000,
        // Set default Content-Type cho JSON requests
        // Axios sẽ tự động set boundary khi dùng FormData
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    // Log để verify Authorization header
    console.log("[serverApiClient] Axios instance created with Authorization header:", token ? `Bearer ${token.substring(0, 20)}...` : 'NO TOKEN');

    // Thêm request interceptor để log request
    instance.interceptors.request.use(
        (config) => {
            // Nếu là FormData, xóa Content-Type để Axios tự động set boundary
            const isFormData = config.data instanceof FormData;
            if (isFormData) {
                delete config.headers['Content-Type'];
            } else if (!config.headers['Content-Type']) {
                // Nếu không phải FormData và chưa có Content-Type, set JSON
                config.headers['Content-Type'] = 'application/json';
            }
            
            // Nếu là FormData, không log toàn bộ data (sẽ rất dài)
            let dataPreview = config.data;

            if (isFormData) {
                const formDataEntries: Record<string, string> = {};
                const formData = config.data as FormData;
                for (const [key, value] of formData.entries()) {
                    if (value instanceof File) {
                        formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes]`;
                    } else {
                        formDataEntries[key] = String(value);
                    }
                }
                dataPreview = formDataEntries;
            }

            console.log("[serverApiClient] Method:", config.method?.toUpperCase());
            console.log("[serverApiClient] Auth Header:", config.headers.Authorization ? `Bearer ${(config.headers.Authorization as string).substring(7, 20)}...` : 'NO TOKEN');
            console.log("[serverApiClient] Content-Type:", config.headers['Content-Type'] || '(will be set by Axios for FormData)');

            // Log FormData chi tiết hơn
            if (isFormData && config.data instanceof FormData) {
                const formDataEntries: Array<{ key: string; value: string }> = [];
                for (const [key, value] of (config.data as FormData).entries()) {
                    if (value instanceof File) {
                        formDataEntries.push({
                            key,
                            value: `File: ${value.name} (${value.size} bytes, type: ${value.type})`
                        });
                    } else {
                        formDataEntries.push({
                            key,
                            value: String(value)
                        });
                    }
                }
                formDataEntries.forEach((entry, index) => {
                });
            } else {
                console.log("[serverApiClient] Data preview:", typeof dataPreview === 'object' ? Object.keys(dataPreview).slice(0, 10) : dataPreview);
            }

            console.log("[serverApiClient] All headers:", Object.keys(config.headers || {}));

            // Đảm bảo method không bị override
            if (config.method) {
                config.method = config.method.toUpperCase();
            }

            // Nếu là FormData, đảm bảo không set Content-Type (để axios tự set với boundary)
            if (isFormData) {
                delete config.headers['Content-Type'];
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Thêm response interceptor để log response và detect HTML redirects
    instance.interceptors.response.use(
        (response) => {
            const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
            const isHtml = typeof response.data === 'string' && (
                contentType.includes('text/html') ||
                (response.data as string).trim().toLowerCase().startsWith('<!doctype') ||
                (response.data as string).trim().toLowerCase().startsWith('<html')
            );

            console.log("[serverApiClient] Response received:", {
                status: response.status,
                statusText: response.statusText,
                contentType: contentType,
                isHtml: isHtml,
                hasData: !!response.data,
                dataType: typeof response.data,
                dataKeys: (response.data && typeof response.data === 'object') ? Object.keys(response.data) : 'N/A',
            });

            // Nếu là HTML response, có thể là redirect từ authentication error
            if (isHtml) {
                // Không throw ở đây, để code phía trên xử lý
            }

            return response;
        },
        (error) => {
            console.error("[serverApiClient] Response error:", {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                statusText: error.response?.statusText,
                contentType: error.response?.headers?.['content-type'],
                dataPreview: typeof error.response?.data === 'string'
                    ? error.response.data.substring(0, 200)
                    : error.response?.data,
            });
            return Promise.reject(error);
        }
    );

    return instance;
}

