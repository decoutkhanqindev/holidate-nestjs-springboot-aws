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
        console.log("[amenityService] Fetching all amenities");
        
        const response = await apiClient.get<ApiResponse<Amenity[]>>(baseURL);

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[amenityService] Found ${response.data.data.length} amenities`);
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        console.error("[amenityService] Error fetching amenities:", error);
        return [];
    }
};

/**
 * Lấy amenities theo category
 */
export const getAmenitiesByCategory = async (categoryId: string): Promise<Amenity[]> => {
    try {
        console.log(`[amenityService] Fetching amenities for category: ${categoryId}`);
        
        const response = await apiClient.get<ApiResponse<Amenity[]>>(
            `${baseURL}/category/${categoryId}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        console.error("[amenityService] Error fetching amenities by category:", error);
        return [];
    }
};

/**
 * Lấy tất cả amenity categories
 */
export const getAmenityCategories = async (): Promise<AmenityCategory[]> => {
    try {
        console.log("[amenityService] Fetching all amenity categories");
        
        const response = await apiClient.get<ApiResponse<AmenityCategory[]>>(categoriesURL);

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[amenityService] Found ${response.data.data.length} categories`);
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        console.error("[amenityService] Error fetching amenity categories:", error);
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
        console.log("[amenityService] Creating new amenity:", request.name);
        
        const payload = {
            name: request.name.trim(),
            free: request.free,
            categoryId: request.categoryId.trim(),
        };
        
        const response = await apiClient.post<ApiResponse<Amenity>>(baseURL, payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[amenityService] Amenity created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[amenityService] Error creating amenity:", error);
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
        console.log("[amenityService] Creating new amenity category:", request.name);
        
        const payload = {
            name: request.name.trim(),
            description: request.description?.trim() || '',
        };
        
        const response = await apiClient.post<ApiResponse<AmenityCategory>>(categoriesURL, payload);
        
        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[amenityService] Amenity category created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[amenityService] Error creating amenity category:", error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo danh mục tiện ích mới';
        throw new Error(errorMessage);
    }
};

