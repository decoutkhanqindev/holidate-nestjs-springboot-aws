// config/api.config.ts
// File cấu hình tập trung cho API URL
// Cho phép dễ dàng chuyển đổi giữa môi trường Production và Local
// Có cơ chế tự động fallback: nếu production down, tự chuyển sang local

/**
 * ============================================
 * ĐỊNH NGHĨA CÁC URL API
 * ============================================
 */
export const API_URLS = {
    /** Backend Production - đã deploy lên host */
    PRODUCTION: 'https://api.holidate.site',

    /** Backend Local - chạy trên máy local (dùng khi production bảo trì) */
    LOCAL: 'http://localhost:8080'
} as const;

/**
 * Storage keys để lưu trạng thái fallback
 */
const FALLBACK_STORAGE_KEY = 'api_fallback_to_local';
const FALLBACK_TIMESTAMP_KEY = 'api_fallback_timestamp';
const FALLBACK_CHECK_INTERVAL = 5 * 60 * 1000; // 5 phút - check lại production sau 5 phút

/**
 * Kiểm tra xem production có đang down không (dựa vào localStorage)
 */
function isProductionDown(): boolean {
    if (typeof window === 'undefined') return false;

    const fallbackFlag = localStorage.getItem(FALLBACK_STORAGE_KEY);
    const timestamp = localStorage.getItem(FALLBACK_TIMESTAMP_KEY);

    if (!fallbackFlag || !timestamp) return false;

    // Nếu đã quá 5 phút, thử lại production
    const now = Date.now();
    const fallbackTime = parseInt(timestamp, 10);
    if (now - fallbackTime > FALLBACK_CHECK_INTERVAL) {
        // Reset flag để thử lại production
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
        return false;
    }

    return fallbackFlag === 'true';
}

/**
 * Đánh dấu production đang down, chuyển sang local
 */
export function markProductionDown(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(FALLBACK_STORAGE_KEY, 'true');
        localStorage.setItem(FALLBACK_TIMESTAMP_KEY, Date.now().toString());
    }
}

/**
 * Đánh dấu production đã hoạt động lại
 */
export function markProductionUp(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
    }
}

function getApiBaseUrl(): string {
    // Nếu có environment variable, dùng giá trị đó (ưu tiên cao nhất)
    if (process.env.NEXT_PUBLIC_API_URL) {
        const envUrl = process.env.NEXT_PUBLIC_API_URL;

        // Nếu env var là production nhưng production đang down, fallback sang local
        if (envUrl === API_URLS.PRODUCTION && isProductionDown()) {
            return API_URLS.LOCAL;
        }

        return envUrl;
    }

    // Nếu không có env var, chọn theo NODE_ENV
    if (process.env.NODE_ENV === 'production') {
        // Nếu production đang down và đang ở development mode, fallback sang local
        if (isProductionDown() && typeof window !== 'undefined') {
            return API_URLS.LOCAL;
        }
        return API_URLS.PRODUCTION;
    }

    // Development mode mặc định dùng local
    return API_URLS.LOCAL;
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Kiểm tra xem đang dùng URL nào
 */
export function isUsingProductionApi(): boolean {
    return API_BASE_URL === API_URLS.PRODUCTION;
}

export function isUsingLocalApi(): boolean {
    return API_BASE_URL === API_URLS.LOCAL;
}


