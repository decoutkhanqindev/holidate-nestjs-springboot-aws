// lib/AdminAPI/entertainmentVenueService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

const baseURL = '/location/entertainment-venues';

export interface EntertainmentVenue {
    id: string;
    name: string;
    distance?: number; // Distance from hotel (in meters)
    address?: string;
    description?: string;
}

export interface EntertainmentVenueCategory {
    id: string;
    name: string;
}

// Cấu trúc thực tế từ API: { id, name, entertainmentVenues: [...] }
export interface EntertainmentVenueByCategory {
    id: string; // Category ID
    name: string; // Category name
    entertainmentVenues: EntertainmentVenue[]; // Array of venues in this category
}

/**
 * Lấy entertainment venues theo city
 */
export const getEntertainmentVenuesByCity = async (cityId: string): Promise<EntertainmentVenueByCategory[]> => {
    try {
        
        const response = await apiClient.get<ApiResponse<EntertainmentVenueByCategory[]>>(
            `${baseURL}/city/${cityId}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return [];
    } catch (error: any) {
        return [];
    }
};


