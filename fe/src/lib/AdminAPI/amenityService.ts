// lib/AdminAPI/amenityService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

const baseURL = '/amenity/amenities';
const categoriesURL = '/amenity/categories';

export interface Amenity {
    id: string;
    name: string;
    free: boolean;
    category?: {
        id: string;
        name: string;
        description: string;
    };
}

export interface AmenityCategory {
    id: string;
    name: string;
    description?: string;
}

/**
 * Lấy tất cả amenities
 */
export const getAmenities = async (): Promise<Amenity[]> => {
    try {
        
        const response = await apiClient.get<ApiResponse<Amenity[]>>(baseURL);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        return [];
    }
};

/**
 * Lấy amenities theo category
 */
export const getAmenitiesByCategory = async (categoryId: string): Promise<Amenity[]> => {
    try {
        
        const response = await apiClient.get<ApiResponse<Amenity[]>>(
            `${baseURL}/category/${categoryId}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        return [];
    }
};

/**
 * Lấy tất cả amenity categories
 */
export const getAmenityCategories = async (): Promise<AmenityCategory[]> => {
    try {
        
        const response = await apiClient.get<ApiResponse<AmenityCategory[]>>(categoriesURL);

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        return [];
    }
};

/**
 * Tạo amenity mới
 */
export interface CreateAmenityRequest {
    name: string;
    free: boolean;
    categoryId: string;
}

export const createAmenity = async (request: CreateAmenityRequest): Promise<Amenity> => {
    try {
        
        const payload = {
            name: request.name.trim(),
            free: request.free,
            categoryId: request.categoryId.trim(),
        };
        
        const response = await apiClient.post<ApiResponse<Amenity>>(baseURL, payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }
        
        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo tiện ích mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo amenity category mới
 */
export interface CreateAmenityCategoryRequest {
    name: string;
    description?: string;
}

export const createAmenityCategory = async (request: CreateAmenityCategoryRequest): Promise<AmenityCategory> => {
    try {
        
        const payload = {
            name: request.name.trim(),
            description: request.description?.trim() || '',
        };
        
        const response = await apiClient.post<ApiResponse<AmenityCategory>>(categoriesURL, payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }
        
        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo danh mục tiện ích mới';
        throw new Error(errorMessage);
    }
};

