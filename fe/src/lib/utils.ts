import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    sub: string;
    fullName: string;
    role?: string;
    id?: string;
    exp?: number;
    iat?: number;
}

/**
 * Kiểm tra token có hợp lệ không (chưa hết hạn)
 */
export const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.exp) return false;
        
        const currentTime = Date.now() / 1000; // Convert to seconds
        return decoded.exp > currentTime;
    } catch {
        return false;
    }
};

/**
 * Lấy thời gian hết hạn của token (milliseconds)
 */
export const getTokenExpiry = (token: string | null): number | null => {
    if (!token) return null;
    
    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (!decoded.exp) return null;
        
        return decoded.exp * 1000; // Convert to milliseconds
    } catch {
        return null;
    }
};

/**
 * Tính thời gian còn lại của token (milliseconds)
 */
export const getTimeUntilExpiry = (token: string | null): number | null => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return null;
    
    return expiry - Date.now();
};

/**
 * Kiểm tra token còn ít hơn X phút (mặc định 5 phút)
 */
export const isTokenExpiringSoon = (token: string | null, minutesBeforeExpiry: number = 5): boolean => {
    const timeUntilExpiry = getTimeUntilExpiry(token);
    if (!timeUntilExpiry) return true; // Nếu không tính được, coi như sắp hết hạn
    
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
    return minutesUntilExpiry <= minutesBeforeExpiry && minutesUntilExpiry > 0;
};

/**
 * Kiểm tra refresh token đã hết hạn chưa (sau 7 ngày)
 * Refresh token sống 7 ngày, được set trong exp của token
 */
export const isRefreshTokenExpired = (refreshToken: string | null): boolean => {
    if (!refreshToken) return true;
    
    // Kiểm tra exp của refresh token - nếu đã hết hạn (exp < currentTime) thì return true
    return !isTokenValid(refreshToken);
};

/**
 * Kiểm tra refresh token có hợp lệ không (chưa hết hạn)
 * Refresh token hợp lệ khi chưa hết hạn (exp chưa qua)
 */
export const isRefreshTokenValid = (refreshToken: string | null): boolean => {
    if (!refreshToken) return false;
    
    // Kiểm tra token chưa hết hạn (exp chưa qua)
    // Backend đã set exp = iat + 7 ngày, nên chỉ cần check exp
    return isTokenValid(refreshToken);
};

