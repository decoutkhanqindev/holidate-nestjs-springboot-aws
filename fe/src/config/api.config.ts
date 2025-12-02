// config/api.config.ts
// File cấu hình tập trung cho API URL
// Chỉ dùng localhost:8080 (từ env var hoặc mặc định)

/**
 * ============================================
 * ĐỊNH NGHĨA URL API
 * ============================================
 */
const DEFAULT_LOCAL_API = 'http://localhost:8080';

function getApiBaseUrl(): string {
    // Nếu có environment variable, LUÔN dùng giá trị đó (ưu tiên cao nhất)
    if (process.env.NEXT_PUBLIC_API_URL) {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        if (typeof window !== 'undefined') {
            console.log('[API Config] Sử dụng API URL từ env var:', envUrl);
        }
        return envUrl;
    }

    // Mặc định dùng localhost:8080
    if (typeof window !== 'undefined') {
        console.log('[API Config] Mặc định dùng Local API:', DEFAULT_LOCAL_API);
    }
    return DEFAULT_LOCAL_API;
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';


