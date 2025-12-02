// lib/client/userService.ts
// Service cho client-side để update user profile
import apiClient, { ApiResponse } from '@/service/apiClient';

const baseURL = '/users';

// Interface từ API response (theo API docs)
export interface UserProfileResponse {
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
    gender?: string; // MALE/FEMALE/OTHER
    dateOfBirth?: string; // ISO datetime format
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

// Interface cho request cập nhật user
export interface UpdateUserProfilePayload {
    fullName?: string;
    phoneNumber?: string;
    address?: string;
    countryId?: string;
    provinceId?: string;
    cityId?: string;
    districtId?: string;
    wardId?: string;
    streetId?: string;
    gender?: string; // MALE/FEMALE/OTHER
    dateOfBirth?: string; // ISO datetime format (YYYY-MM-DDTHH:mm:ss)
    avatarFile?: File; // Multipart file (backend dùng "avatarFile")
}

/**
 * Lấy thông tin user theo ID (để load profile)
 */
export async function getUserProfile(userId: string): Promise<UserProfileResponse> {
    // Validate userId
    if (!userId || userId.trim() === '' || userId === 'undefined' || userId === 'null') {
        console.error('[UserService] ❌ userId không hợp lệ:', userId);
        throw new Error('User ID không hợp lệ');
    }

    try {
        const url = `${baseURL}/${userId}`;
        console.log('[UserService] Gọi API getUserProfile:', url);
        
        const response = await apiClient.get<ApiResponse<UserProfileResponse>>(url);

        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[UserService] ❌ Lỗi khi gọi getUserProfile:', {
            userId,
            error: error.message,
            response: error.response?.data
        });
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải thông tin người dùng';
        throw new Error(errorMessage);
    }
}

/**
 * Cập nhật user profile
 * PUT /users/{id} - Content-Type: multipart/form-data
 */
export async function updateUserProfile(userId: string, payload: UpdateUserProfilePayload): Promise<UserProfileResponse> {
    try {

        const formData = new FormData();
        // Chỉ append các field có giá trị (không phải undefined, null, hoặc empty string)
        if (payload.fullName && payload.fullName.trim()) formData.append('fullName', payload.fullName.trim());
        if (payload.phoneNumber && payload.phoneNumber.trim()) formData.append('phoneNumber', payload.phoneNumber.trim());
        if (payload.address && payload.address.trim()) formData.append('address', payload.address.trim());
        if (payload.countryId && payload.countryId.trim()) formData.append('countryId', payload.countryId.trim());
        if (payload.provinceId && payload.provinceId.trim()) formData.append('provinceId', payload.provinceId.trim());
        if (payload.cityId && payload.cityId.trim()) formData.append('cityId', payload.cityId.trim());
        if (payload.districtId && payload.districtId.trim()) formData.append('districtId', payload.districtId.trim());
        if (payload.wardId && payload.wardId.trim()) formData.append('wardId', payload.wardId.trim());
        if (payload.streetId && payload.streetId.trim()) formData.append('streetId', payload.streetId.trim());
        if (payload.gender && payload.gender.trim()) formData.append('gender', payload.gender.trim());
        if (payload.dateOfBirth && payload.dateOfBirth.trim()) formData.append('dateOfBirth', payload.dateOfBirth.trim());
        if (payload.avatarFile) formData.append('avatarFile', payload.avatarFile); // Backend dùng "avatarFile"

        // Log formData để debug
        for (const [key, value] of formData.entries()) {
        }

        const response = await apiClient.put<ApiResponse<UserProfileResponse>>(
            `${baseURL}/${userId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật thông tin người dùng';
        throw new Error(errorMessage);
    }
}

