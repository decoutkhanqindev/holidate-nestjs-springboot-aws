// lib/AdminAPI/roleService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

export interface Role {
    id: string;
    name: string;
    description: string;
}

/**
 * Lấy danh sách tất cả roles
 */
export const getRoles = async (): Promise<Role[]> => {
    try {
        console.log("[roleService] Fetching all roles...");

        const response = await apiClient.get<ApiResponse<Role[]>>('/roles');

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[roleService] Found ${response.data.data.length} roles`);
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[roleService] Error fetching roles:", error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể lấy danh sách vai trò';
        throw new Error(errorMessage);
    }
};

/**
 * Lấy role "partner" (để lấy roleId khi tạo partner mới)
 */
export const getPartnerRole = async (): Promise<Role | null> => {
    try {
        const roles = await getRoles();
        const partnerRole = roles.find(r => r.name.toLowerCase() === 'partner');
        return partnerRole || null;
    } catch (error: any) {
        console.error("[roleService] Error getting partner role:", error);
        return null;
    }
};







































