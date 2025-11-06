// lib/client/locationService.ts
// Service cho client-side để lấy location data
import apiClient, { ApiResponse } from '@/service/apiClient';

const baseURL = '/location';

export interface LocationOption {
    id: string;
    name: string;
    code?: string;
}

/**
 * Lấy danh sách countries
 */
export async function getCountries(): Promise<LocationOption[]> {
    try {
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/countries`);
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching countries:', error);
        return [];
    }
}

/**
 * Lấy danh sách provinces
 */
export async function getProvinces(countryId?: string): Promise<LocationOption[]> {
    try {
        const params: any = {};
        if (countryId) params.countryId = countryId;
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/provinces`, { params });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching provinces:', error);
        return [];
    }
}

/**
 * Lấy danh sách cities
 */
export async function getCities(provinceId?: string): Promise<LocationOption[]> {
    try {
        const params: any = {};
        if (provinceId) params.provinceId = provinceId;
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/cities`, { params });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching cities:', error);
        return [];
    }
}

/**
 * Lấy danh sách districts
 */
export async function getDistricts(cityId?: string): Promise<LocationOption[]> {
    try {
        const params: any = {};
        if (cityId) params.cityId = cityId;
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/districts`, { params });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching districts:', error);
        return [];
    }
}

/**
 * Lấy danh sách wards
 */
export async function getWards(districtId?: string): Promise<LocationOption[]> {
    try {
        const params: any = {};
        if (districtId) params.districtId = districtId;
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/wards`, { params });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching wards:', error);
        return [];
    }
}

/**
 * Lấy danh sách streets
 */
export async function getStreets(wardId?: string): Promise<LocationOption[]> {
    try {
        const params: any = {};
        if (wardId) params.wardId = wardId;
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(`${baseURL}/streets`, { params });
        if (response.data?.statusCode === 200 && response.data?.data) {
            return response.data.data;
        }
        return [];
    } catch (error) {
        console.error('[locationService] Error fetching streets:', error);
        return [];
    }
}




