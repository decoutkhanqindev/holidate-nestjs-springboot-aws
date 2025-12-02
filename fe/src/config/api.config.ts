
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
        console.log('[API Config] Đã reset fallback flag, quay lại dùng Production API');
    }
}

/**
 * Dùng khi muốn force reset về production sau khi đã fallback sang local
 */
export function resetToProductionApi(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
        console.log('[API Config]  Đã force reset về Production API:', API_URLS.PRODUCTION);
        // Reload page để áp dụng thay đổi
        window.location.reload();
    }
}

function getApiBaseUrl(): string {


    // Nếu có environment variable và nó trỏ đến production, dùng nó
    if (process.env.NEXT_PUBLIC_API_URL) {
        const envUrl = process.env.NEXT_PUBLIC_API_URL.trim();
        // Nếu env var là production URL, dùng nó
        if (envUrl === API_URLS.PRODUCTION) {
            if (typeof window !== 'undefined') {
                console.log('[API Config]  Sử dụng Production API từ env var:', envUrl);
            }
            return envUrl;
        }
        // Nếu env var là local và đang ở production mode, cảnh báo
        if (envUrl === API_URLS.LOCAL && process.env.NODE_ENV === 'production') {
            console.warn('[API Config] WARNING: Đang ở production mode nhưng env var trỏ đến local. Dùng Production API thay vì local.');
            return API_URLS.PRODUCTION;
        }
        // Trong development, cho phép dùng local nếu env var chỉ định
        if (typeof window !== 'undefined') {
            console.log('[API Config] Sử dụng API URL từ env var:', envUrl);
        }
        return envUrl;
    }

    // Mặc định LUÔN dùng Production API (https://api.holidate.site)
    // Reset fallback flag cũ nếu có để đảm bảo luôn thử production trước
    if (typeof window !== 'undefined') {
        console.log('[API Config]  Mặc định dùng Production API:', API_URLS.PRODUCTION);
        const fallbackFlag = localStorage.getItem(FALLBACK_STORAGE_KEY);
        if (fallbackFlag === 'true') {
            console.warn('[API Config] Phát hiện fallback flag cũ trong localStorage. Đang reset để dùng Production API...');
            localStorage.removeItem(FALLBACK_STORAGE_KEY);
            localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
        }
    }
    return API_URLS.PRODUCTION;
}

export const API_BASE_URL = getApiBaseUrl();


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


