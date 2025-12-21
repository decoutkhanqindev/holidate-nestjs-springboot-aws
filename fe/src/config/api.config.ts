export const API_URLS = {
    PRODUCTION: 'https://api.holidate.site',
    LOCAL: 'http://localhost:8080'
} as const;

const FALLBACK_STORAGE_KEY = 'api_fallback_to_local';
const FALLBACK_TIMESTAMP_KEY = 'api_fallback_timestamp';
const FALLBACK_CHECK_INTERVAL = 5 * 60 * 1000;

function isProductionDown(): boolean {
    if (typeof window === 'undefined') return false;

    const fallbackFlag = localStorage.getItem(FALLBACK_STORAGE_KEY);
    const timestamp = localStorage.getItem(FALLBACK_TIMESTAMP_KEY);

    if (!fallbackFlag || !timestamp) return false;

    const now = Date.now();
    const fallbackTime = parseInt(timestamp, 10);
    if (now - fallbackTime > FALLBACK_CHECK_INTERVAL) {
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
        return false;
    }

    return fallbackFlag === 'true';
}

export function markProductionDown(): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(FALLBACK_STORAGE_KEY, 'true');
        localStorage.setItem(FALLBACK_TIMESTAMP_KEY, Date.now().toString());
    }
}

export function markProductionUp(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(FALLBACK_STORAGE_KEY);
        localStorage.removeItem(FALLBACK_TIMESTAMP_KEY);
    }
}

function getApiBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL;
    }

    if (process.env.NODE_ENV === 'production') {
        return API_URLS.PRODUCTION;
    }

    return API_URLS.LOCAL;
}

export const API_BASE_URL = getApiBaseUrl();

export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

export function isUsingProductionApi(): boolean {
    return API_BASE_URL === API_URLS.PRODUCTION;
}

export function isUsingLocalApi(): boolean {
    return API_BASE_URL === API_URLS.LOCAL;
}


