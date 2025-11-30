// lib/AdminAPI/partnerService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

export interface Partner {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string | null;
    address?: string | null;
    role: {
        id: string;
        name: string;
        description: string;
    };
    createdAt: string;
    updatedAt?: string | null;
}

/**
 * Lấy danh sách tất cả partners (users có role "partner")
 */
export const getPartners = async (): Promise<Partner[]> => {
    try {

        const response = await apiClient.get<ApiResponse<Partner[]>>('/users');

        if (response.data.statusCode === 200 && response.data.data) {
            // Lọc chỉ lấy users có role.name === "partner"
            const partners = response.data.data.filter(
                (user) => user.role?.name?.toLowerCase() === 'partner'
            );

            return partners;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể lấy danh sách đối tác';
        throw new Error(errorMessage);
    }
};

/**
 * Lấy partner by ID
 */
export const getPartnerById = async (partnerId: string): Promise<Partner | null> => {
    try {
        const response = await apiClient.get<ApiResponse<Partner>>(`/users/${partnerId}`);

        if (response.data.statusCode === 200 && response.data.data) {
            const user = response.data.data;
            // Kiểm tra xem có phải partner không
            if (user.role?.name?.toLowerCase() === 'partner') {
                return user;
            }
            return null;
        }

        return null;
    } catch (error: any) {
        return null;
    }
};

/**
 * Tạo partner mới (user với role "partner")
 */
export interface CreatePartnerRequest {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    roleId: string; // ID của role "partner"
    authProvider?: 'LOCAL' | 'GOOGLE'; // Mặc định là 'LOCAL'
}

export const createPartner = async (request: CreatePartnerRequest): Promise<Partner> => {
    try {

        const payload = {
            email: request.email.trim(),
            password: request.password,
            fullName: request.fullName.trim(),
            phoneNumber: request.phoneNumber?.trim() || null,
            roleId: request.roleId.trim(),
            authProvider: request.authProvider || 'LOCAL',
        };

        const response = await apiClient.post<ApiResponse<Partner>>('/users', payload);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo đối tác mới';
        throw new Error(errorMessage);
    }
};

