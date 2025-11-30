// lib/AdminAPI/photoCategoryService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

export interface PhotoCategory {
    id: string;
    name: string;
}

/**
 * Lấy tất cả photo categories (client-side)
 */
export const getPhotoCategories = async (): Promise<PhotoCategory[]> => {
    try {

        const response = await apiClient.get<ApiResponse<PhotoCategory[]>>(
            '/image/photo-categories'
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách danh mục ảnh');
    }
};

/**
 * Lấy tất cả photo categories (server-side)
 */
export const getPhotoCategoriesServer = async (): Promise<PhotoCategory[]> => {
    try {
        console.log('[photoCategoryService] Fetching photo categories (server)...');

        const serverClient = await createServerApiClient();

        const response = await serverClient.get<ApiResponse<PhotoCategory[]>>(
            '/image/photo-categories'
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        console.error('[photoCategoryService] Error fetching photo categories (server):', error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách danh mục ảnh');
    }
};

