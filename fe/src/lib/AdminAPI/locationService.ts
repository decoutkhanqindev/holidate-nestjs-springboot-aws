// lib/AdminAPI/locationService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";

export interface LocationOption {
    id: string;
    name: string;
    code?: string;
}

// Get all countries
export const getCountries = async (): Promise<LocationOption[]> => {
    try {
        const response = await apiClient.get<ApiResponse<LocationOption[]>>('/location/countries');
        return response.data.data || [];
    } catch (error) {
        console.error('[locationService] Error fetching countries:', error);
        return [];
    }
};

// Get provinces by countryId (hoặc lấy tất cả nếu không có countryId)
export const getProvinces = async (countryId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        let url = '/location/provinces?';
        const params: string[] = [];

        if (countryId && countryId.trim() !== '') {
            params.push(`country-id=${encodeURIComponent(countryId.trim())}`);
        }
        if (name && name.trim() !== '') {
            params.push(`name=${encodeURIComponent(name.trim())}`);
        }

        if (params.length > 0) {
            url = `/location/provinces?${params.join('&')}`;
        } else {
            url = '/location/provinces';
        }

        console.log('[locationService] Fetching provinces:', url);
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        return response.data.data || [];
    } catch (error) {
        console.error('[locationService] Error fetching provinces:', error);
        return [];
    }
};

// Get cities by provinceId (hoặc lấy tất cả nếu không có provinceId)
export const getCities = async (provinceId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        let url = '/location/cities?';
        const params: string[] = [];

        if (provinceId && provinceId.trim() !== '') {
            params.push(`province-id=${encodeURIComponent(provinceId.trim())}`);
        }
        if (name && name.trim() !== '') {
            params.push(`name=${encodeURIComponent(name.trim())}`);
        }

        if (params.length > 0) {
            url = `/location/cities?${params.join('&')}`;
        } else {
            url = '/location/cities';
        }

        console.log('[locationService] Fetching cities:', url);
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        return response.data.data || [];
    } catch (error) {
        console.error('[locationService] Error fetching cities:', error);
        return [];
    }
};

// Get districts by cityId (hoặc search theo name nếu không có cityId)
export const getDistricts = async (cityId?: string, provinceId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        let url = '/location/districts?';
        const params: string[] = [];

        if (cityId && cityId.trim() !== '') {
            // Ưu tiên filter theo cityId
            params.push(`city-id=${encodeURIComponent(cityId.trim())}`);
        }
        if (name && name.trim() !== '' && !cityId) {
            // Chỉ dùng name khi không có cityId
            params.push(`name=${encodeURIComponent(name.trim())}`);
        }

        if (params.length > 0) {
            url = `/location/districts?${params.join('&')}`;
        } else {
            url = '/location/districts';
        }

        console.log(`[locationService] Fetching districts:`, url);
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const districts = response.data.data || [];
        console.log(`[locationService] Received ${districts.length} districts`);

        return districts;
    } catch (error: any) {
        console.error('[locationService] Error fetching districts:', error);
        console.error('[locationService] Error details:', error.response?.data || error.message);
        return [];
    }
};

// Get wards by districtId (hoặc search theo name nếu không có districtId)
export const getWards = async (districtId?: string, cityId?: string, provinceId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        let url = '/location/wards?';
        const params: string[] = [];

        if (districtId && districtId.trim() !== '') {
            // Ưu tiên filter theo districtId
            params.push(`district-id=${encodeURIComponent(districtId.trim())}`);
        }
        if (name && name.trim() !== '' && !districtId) {
            // Chỉ dùng name khi không có districtId
            params.push(`name=${encodeURIComponent(name.trim())}`);
        }

        if (params.length > 0) {
            url = `/location/wards?${params.join('&')}`;
        } else {
            url = '/location/wards';
        }

        console.log(`[locationService] Fetching wards:`, url);
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const wards = response.data.data || [];
        console.log(`[locationService] Received ${wards.length} wards`);

        return wards;
    } catch (error: any) {
        console.error('[locationService] Error fetching wards:', error);
        console.error('[locationService] Error details:', error.response?.data || error.message);
        return [];
    }
};

// Get streets by wardId (hoặc search theo name nếu không có wardId)
export const getStreets = async (wardId?: string, districtId?: string, cityId?: string, provinceId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        let url = '/location/streets?';
        const params: string[] = [];

        if (wardId && wardId.trim() !== '') {
            // Ưu tiên filter theo wardId
            params.push(`ward-id=${encodeURIComponent(wardId.trim())}`);
        }
        if (name && name.trim() !== '' && !wardId) {
            // Chỉ dùng name khi không có wardId
            params.push(`name=${encodeURIComponent(name.trim())}`);
        }

        if (params.length > 0) {
            url = `/location/streets?${params.join('&')}`;
        } else {
            url = '/location/streets';
        }

        console.log(`[locationService] Fetching streets:`, url);
        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const streets = response.data.data || [];
        console.log(`[locationService] Received ${streets.length} streets`);

        return streets;
    } catch (error: any) {
        console.error('[locationService] Error fetching streets:', error);
        console.error('[locationService] Error details:', error.response?.data || error.message);
        return [];
    }
};

// ==================== CREATE LOCATION FUNCTIONS ====================

/**
 * Tạo Street mới
 */
export const createStreet = async (name: string, wardId: string): Promise<LocationOption> => {
    try {
        console.log(`[locationService] Creating street: ${name} for wardId: ${wardId}`);
        const response = await apiClient.post<ApiResponse<LocationOption>>('/location/streets', {
            name: name.trim(),
            wardId: wardId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[locationService] Street created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating street:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo đường mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo Ward mới
 */
export const createWard = async (name: string, districtId: string): Promise<LocationOption> => {
    try {
        console.log(`[locationService] Creating ward: ${name} for districtId: ${districtId}`);
        const response = await apiClient.post<ApiResponse<LocationOption>>('/location/wards', {
            name: name.trim(),
            districtId: districtId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[locationService] Ward created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating ward:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo phường/xã mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo District mới
 */
export const createDistrict = async (name: string, cityId: string): Promise<LocationOption> => {
    try {
        console.log(`[locationService] Creating district: ${name} for cityId: ${cityId}`);
        const response = await apiClient.post<ApiResponse<LocationOption>>('/location/districts', {
            name: name.trim(),
            cityId: cityId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[locationService] District created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating district:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo quận/huyện mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo City mới
 */
export const createCity = async (name: string, code: string, provinceId: string): Promise<LocationOption> => {
    try {
        console.log(`[locationService] Creating city: ${name} for provinceId: ${provinceId}`);
        const response = await apiClient.post<ApiResponse<LocationOption>>('/location/cities', {
            name: name.trim(),
            code: code.trim() || '',
            provinceId: provinceId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[locationService] City created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating city:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo thành phố/quận mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo Province mới
 */
export const createProvince = async (name: string, code: string, countryId: string): Promise<LocationOption> => {
    try {
        console.log(`[locationService] Creating province: ${name} for countryId: ${countryId}`);
        const response = await apiClient.post<ApiResponse<LocationOption>>('/location/provinces', {
            name: name.trim(),
            code: code.trim() || '',
            countryId: countryId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log(`[locationService] Province created successfully: ${response.data.data.id}`);
            return response.data.data;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating province:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo tỉnh/thành phố mới';
        throw new Error(errorMessage);
    }
};

