// File: src/service/amenityService.ts

import { hotelService } from './hotelService';
import { AxiosInstance } from 'axios';

// Interface cho một tiện ích cụ thể
export interface Amenity {
    id: string;
    name: string;
    free: boolean;
    categoryId?: string; // Thêm categoryId
}

// Interface cho một nhóm tiện ích
export interface AmenityCategory {
    id: string;
    name: string;
}

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

class AmenityService {
    // Sửa lại: Dùng lại axios instance từ hotelService để không cần tạo mới
    private api: AxiosInstance = (hotelService as any).api;

    /**
     * Lấy tất cả các NHÓM tiện nghi (Categories)
     */
    async getAllAmenityCategories(): Promise<AmenityCategory[]> {
        try {
            const response = await this.api.get<ApiResponse<AmenityCategory[]>>('/amenity/categories');
            return response.data.data;
        } catch (error) {
            console.error('Lỗi khi tải danh sách nhóm tiện nghi:', error);
            return [];
        }
    }

    /**
     * Lấy tất cả các TIỆN NGHI CON thuộc một nhóm cụ thể
     * @param categoryId ID của nhóm tiện nghi
     */
    async getAmenitiesByCategoryId(categoryId: string): Promise<Amenity[]> {
        try {
            const response = await this.api.get<ApiResponse<Amenity[]>>(`/amenity/amenities/category/${categoryId}`);
            return response.data.data;
        } catch (error) {
            console.error(`Lỗi khi tải tiện nghi cho category ${categoryId}:`, error);
            return [];
        }
    }
}

export const amenityService = new AmenityService();