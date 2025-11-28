// lib/AdminAPI/userService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import { createServerApiClient } from './serverApiClient';
import type { User } from '@/types';

const baseURL = '/users';
const rolesURL = '/roles';

// Interface từ API response
interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    country?: { id: string; name: string };
    province?: { id: string; name: string };
    city?: { id: string; name: string };
    district?: { id: string; name: string };
    ward?: { id: string; name: string };
    street?: { id: string; name: string };
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    role: {
        id: string;
        name: string;
        description?: string;
    };
    authInfo?: {
        provider: string;
        verified: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface RoleResponse {
    id: string;
    name: string;
    description?: string;
}

// Interface cho request tạo user
export interface CreateUserPayload {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    countryId?: string;
    provinceId?: string;
    cityId?: string;
    districtId?: string;
    wardId?: string;
    streetId?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    roleId: string; // Required - ID của role
    authProvider: string; // Required - "LOCAL" hoặc "GOOGLE"
}

// Interface cho request cập nhật user
export interface UpdateUserPayload {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    countryId?: string;
    provinceId?: string;
    cityId?: string;
    districtId?: string;
    wardId?: string;
    streetId?: string;
    gender?: string;
    dateOfBirth?: string;
    avatarFile?: File; // Multipart file
    active?: boolean; // User active status
}

/**
 * Map UserResponse từ API sang User type (frontend)
 */
function mapUserResponseToUser(response: UserResponse): User {
    // Map role name từ API sang UserRole type
    const roleMap: Record<string, User['role']> = {
        'SUPER_ADMIN': 'SUPER_ADMIN',
        'HOTEL_ADMIN': 'HOTEL_ADMIN',
        'HOTEL_STAFF': 'HOTEL_STAFF',
        'CUSTOMER': 'CUSTOMER',
        'USER': 'CUSTOMER', // Backend có thể dùng USER thay vì CUSTOMER
    };

    return {
        id: parseInt(response.id) || 0, // Frontend dùng number, backend dùng string UUID
        username: response.fullName, // Frontend dùng username, backend dùng fullName
        email: response.email,
        avatarUrl: response.avatarUrl || '/avatars/default.png',
        role: roleMap[response.role.name] || 'CUSTOMER',
        status: 'ACTIVE', // Backend không có status field trong UserResponse, mặc định ACTIVE
    };
}

/**
 * Lấy danh sách roles từ API
 */
export async function getRoles(): Promise<RoleResponse[]> {
    try {
        console.log('[userService] Fetching roles...');
        const response = await apiClient.get<ApiResponse<RoleResponse[]>>(rolesURL);

        if (response.data?.statusCode === 200 && response.data?.data) {
            console.log('[userService] Roles fetched:', response.data.data.length);
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[userService] Error fetching roles:', error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải danh sách quyền';
        throw new Error(errorMessage);
    }
}

/**
 * Lấy danh sách users từ API
 * Admin khách sạn chỉ có thể tạo nhân viên (HOTEL_STAFF role)
 * 
 * Note: GET /users chỉ dành cho ADMIN role. HOTEL_ADMIN có thể không có quyền.
 * Nếu 403, trả về mảng rỗng thay vì throw error.
 */
export async function getUsers({ page = 1, limit = 10 }: { page?: number; limit?: number }): Promise<{
    data: User[];
    totalPages: number;
    currentPage: number;
}> {
    try {
        console.log(`[userService] Fetching users - page: ${page}, limit: ${limit}`);

        // Backend API GET /users không hỗ trợ phân trang, trả về tất cả users
        const response = await apiClient.get<ApiResponse<UserResponse[]>>(baseURL);

        if (response.data?.statusCode === 200 && response.data?.data) {
            let allUsers = response.data.data.map(mapUserResponseToUser);

            // Filter: Admin khách sạn chỉ thấy HOTEL_STAFF và CUSTOMER
            // (Có thể filter ở backend nếu có query param, nhưng hiện tại filter ở frontend)
            const viewableUsers = allUsers.filter(user =>
                user.role === 'HOTEL_STAFF' || user.role === 'CUSTOMER'
            );

            // Phân trang ở frontend
            const totalItems = viewableUsers.length;
            const totalPages = Math.ceil(totalItems / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedData = viewableUsers.slice(start, end);

            console.log(`[userService] Users fetched: ${paginatedData.length} of ${viewableUsers.length} total`);
            return {
                data: paginatedData,
                totalPages,
                currentPage: page,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[userService] Error fetching users:', error);

        // Nếu là lỗi 403 (Forbidden), có thể do role không có quyền
        // Trả về mảng rỗng thay vì throw error để page vẫn có thể hiển thị
        if (error.response?.status === 403) {
            console.warn('[userService] 403 Forbidden - User may not have permission to view all users');
            return {
                data: [],
                totalPages: 0,
                currentPage: page,
            };
        }

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải danh sách người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Lấy thông tin user hiện tại (từ token)
 * Trả về null nếu không lấy được (không throw error)
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { getCurrentUserInfo } = await import('./adminAuthService');
        const userInfo = await getCurrentUserInfo();

        // Map từ AuthMeResponse sang User
        const roleMap: Record<string, User['role']> = {
            'SUPER_ADMIN': 'SUPER_ADMIN',
            'HOTEL_ADMIN': 'HOTEL_ADMIN',
            'HOTEL_STAFF': 'HOTEL_STAFF',
            'CUSTOMER': 'CUSTOMER',
            'USER': 'CUSTOMER',
        };

        return {
            id: parseInt(userInfo.id) || 0,
            username: userInfo.fullName,
            email: userInfo.email,
            avatarUrl: '/avatars/default.png',
            role: roleMap[userInfo.role.name] || 'CUSTOMER',
            status: 'ACTIVE',
        };
    } catch (error: any) {
        console.error('[userService] Error getting current user:', error);
        // Trả về null thay vì throw error để page vẫn có thể hiển thị
        return null;
    }
}

/**
 * Lấy user theo ID
 */
export async function getUserById(userId: string): Promise<User> {
    try {
        console.log(`[userService] Fetching user: ${userId}`);
        const response = await apiClient.get<ApiResponse<UserResponse>>(`${baseURL}/${userId}`);

        if (response.data?.statusCode === 200 && response.data?.data) {
            return mapUserResponseToUser(response.data.data);
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[userService] Error fetching user ${userId}:`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải thông tin người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Tạo user mới - Client version
 */
export async function createUser(payload: CreateUserPayload): Promise<UserResponse> {
    try {
        console.log('[userService] Creating user:', { email: payload.email, roleId: payload.roleId });

        const response = await apiClient.post<ApiResponse<UserResponse>>(baseURL, payload);

        if (response.data?.statusCode === 200 && response.data?.data) {
            console.log('[userService] ✅ User created successfully');
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[userService] Error creating user:', error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Tạo user mới - Server version (dùng cho server actions)
 */
export async function createUserServer(payload: CreateUserPayload): Promise<UserResponse> {
    try {
        console.log('[userService] Creating user (server):', { email: payload.email, roleId: payload.roleId });

        const serverClient = await createServerApiClient();
        const response = await serverClient.post<ApiResponse<UserResponse>>(baseURL, payload);

        if (response.data?.statusCode === 200 && response.data?.data) {
            console.log('[userService] ✅ User created successfully (server)');
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[userService] Error creating user (server):', error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Cập nhật user - Client version
 */
export async function updateUser(userId: string, payload: UpdateUserPayload): Promise<UserResponse> {
    try {
        console.log(`[userService] Updating user ${userId}...`);

        const formData = new FormData();
        if (payload.fullName) formData.append('fullName', payload.fullName);
        if (payload.phoneNumber) formData.append('phoneNumber', payload.phoneNumber);
        if (payload.address) formData.append('address', payload.address);
        if (payload.countryId) formData.append('countryId', payload.countryId);
        if (payload.provinceId) formData.append('provinceId', payload.provinceId);
        if (payload.cityId) formData.append('cityId', payload.cityId);
        if (payload.districtId) formData.append('districtId', payload.districtId);
        if (payload.wardId) formData.append('wardId', payload.wardId);
        if (payload.streetId) formData.append('streetId', payload.streetId);
        if (payload.gender) formData.append('gender', payload.gender);
        if (payload.dateOfBirth) formData.append('dateOfBirth', payload.dateOfBirth);
        if (payload.avatarFile) formData.append('avatarFile', payload.avatarFile);
        if (payload.active !== undefined) formData.append('active', String(payload.active));

        const response = await apiClient.put<ApiResponse<UserResponse>>(
            `${baseURL}/${userId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data?.statusCode === 200 && response.data?.data) {
            console.log('[userService] ✅ User updated successfully');
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[userService] Error updating user ${userId}:`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Cập nhật user - Server version
 */
export async function updateUserServer(userId: string, payload: UpdateUserPayload): Promise<UserResponse> {
    try {
        console.log(`[userService] Updating user ${userId} (server)...`);

        const formData = new FormData();
        if (payload.fullName) formData.append('fullName', payload.fullName);
        if (payload.phoneNumber) formData.append('phoneNumber', payload.phoneNumber);
        if (payload.address) formData.append('address', payload.address);
        if (payload.countryId) formData.append('countryId', payload.countryId);
        if (payload.provinceId) formData.append('provinceId', payload.provinceId);
        if (payload.cityId) formData.append('cityId', payload.cityId);
        if (payload.districtId) formData.append('districtId', payload.districtId);
        if (payload.wardId) formData.append('wardId', payload.wardId);
        if (payload.streetId) formData.append('streetId', payload.streetId);
        if (payload.gender) formData.append('gender', payload.gender);
        if (payload.dateOfBirth) formData.append('dateOfBirth', payload.dateOfBirth);
        if (payload.avatarFile) formData.append('avatarFile', payload.avatarFile);
        if (payload.active !== undefined) formData.append('active', String(payload.active));

        const serverClient = await createServerApiClient();
        const response = await serverClient.put<ApiResponse<UserResponse>>(
            `${baseURL}/${userId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data?.statusCode === 200 && response.data?.data) {
            console.log('[userService] ✅ User updated successfully (server)');
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[userService] Error updating user ${userId} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Xóa user - Server version (dùng cho server actions)
 */
export async function deleteUserServer(userId: string): Promise<void> {
    try {
        console.log(`[userService] Deleting user ${userId} (server)`);

        const serverClient = await createServerApiClient();
        const response = await serverClient.delete<ApiResponse<UserResponse>>(`${baseURL}/${userId}`);

        if (response.data?.statusCode === 200 || response.status === 200 || response.status === 204) {
            console.log(`[userService] ✅ User deleted successfully (server): ${userId}`);
            return;
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        console.error(`[userService] Error deleting user ${userId} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa người dùng';
        throw new Error(errorMessage);
    }
}
