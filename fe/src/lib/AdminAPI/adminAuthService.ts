// lib/AdminAPI/adminAuthService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    id: string;
    email: string;
    fullName: string;
    role: {
        id: string;
        name: string;
        description: string;
    };
    accessToken: string;
    expiresAt: string;
    refreshToken: string;
}

export interface AuthMeResponse {
    id: string;
    email: string;
    fullName: string;
    role: {
        id: string;
        name: string;
        description: string;
    };
}

/**
 * Đăng nhập admin
 */
export const loginAdmin = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {

        const response = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            {
                email: credentials.email,
                password: credentials.password,
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const loginData = response.data.data;

            // Lưu token vào localStorage (apiClient sẽ tự động dùng nó)
            if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', loginData.accessToken);
                localStorage.setItem('refreshToken', loginData.refreshToken);

                // QUAN TRỌNG: Xóa userId khỏi localStorage để tránh conflict với Client context
                // Client context chỉ nên khôi phục session cho USER role
                // Admin/Partner không cần userId trong localStorage
                localStorage.removeItem('userId');

                // Lưu token vào cookie để server actions có thể đọc
                // Cookie cần thiết cho server-side requests (server actions)
                // IMPORTANT: Cookie phải được set với đúng domain và path
                const maxAge = 60 * 60 * 24 * 7; // 7 ngày (604800 seconds)
                
                // Set cookie với đầy đủ options
                const cookieOptions = `path=/; max-age=${maxAge}; SameSite=Lax`;
                document.cookie = `accessToken=${loginData.accessToken}; ${cookieOptions}`;
                document.cookie = `refreshToken=${loginData.refreshToken}; ${cookieOptions}`;
                
                // Verify cookie đã được set
                const cookieSet = document.cookie.includes('accessToken=');
                console.log("[adminAuthService] Token saved:", {
                    localStorage: true,
                    cookieSet: cookieSet,
                    cookieValue: cookieSet ? 'Set' : 'NOT SET - Check browser console',
                });
                
                if (!cookieSet) {
                }

            }

            return loginData;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Đăng nhập thất bại. Vui lòng thử lại.';
        throw new Error(errorMessage);
    }
};

/**
 * Lấy thông tin user hiện tại (từ token)
 */
export const getCurrentUserInfo = async (): Promise<AuthMeResponse> => {
    try {
        const response = await apiClient.get<ApiResponse<AuthMeResponse>>('/auth/me');

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể lấy thông tin user';
        throw new Error(errorMessage);
    }
};

/**
 * Đăng xuất
 */
export const logoutAdmin = async (): Promise<void> => {
    try {
        const refreshToken = typeof window !== 'undefined'
            ? localStorage.getItem('refreshToken')
            : null;

        if (refreshToken) {
            await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/logout', {
                token: refreshToken,
            });
        }
    } catch (error: any) {
        // Không throw error, vẫn xóa token local dù API có lỗi
    } finally {
        // Xóa token khỏi localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('adminUser');
        }
    }
};

