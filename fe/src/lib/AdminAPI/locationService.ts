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
        const response = await apiClient.post<ApiResponse<any>>('/location/streets', {
            name: name.trim(),
            wardId: wardId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            console.log(`[locationService] Street created successfully: ${result.id}`);
            return result;
        }
        console.error('[locationService] Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] Error creating street:', error);
        console.error('[locationService] Error response:', error.response?.data);
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
        const response = await apiClient.post<ApiResponse<any>>('/location/wards', {
            name: name.trim(),
            districtId: districtId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            console.log(`[locationService] Ward created successfully: ${result.id}`);
            return result;
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
        const response = await apiClient.post<ApiResponse<any>>('/location/districts', {
            name: name.trim(),
            cityId: cityId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            console.log(`[locationService] District created successfully: ${result.id}`);
            return result;
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
        const response = await apiClient.post<ApiResponse<any>>('/location/cities', {
            name: name.trim(),
            code: code.trim() || '',
            provinceId: provinceId.trim(),
        });

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            console.log(`[locationService] City created successfully: ${result.id}`);
            return result;
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
    // Request body để gửi lên backend (định nghĩa ở ngoài để dùng trong catch block)
    const requestBody = {
        name: name.trim(),
        code: code.trim() || '',
        countryId: countryId.trim(),
    };
    
    try {
        console.log(`[locationService] ===== CREATING PROVINCE =====`);
        console.log(`[locationService] Request URL: POST /location/provinces`);
        console.log(`[locationService] Request Body (JSON):`, JSON.stringify(requestBody, null, 2));
        console.log(`[locationService] Request Body (raw):`, requestBody);
        console.log(`[locationService] - name: "${requestBody.name}" (length: ${requestBody.name.length})`);
        console.log(`[locationService] - code: "${requestBody.code}" (length: ${requestBody.code.length})`);
        console.log(`[locationService] - countryId: "${requestBody.countryId}"`);
        console.log(`[locationService] ===== END REQUEST =====`);
        
        const response = await apiClient.post<ApiResponse<any>>('/location/provinces', requestBody);

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            console.log(`[locationService] Province created successfully: ${result.id}`);
            return result;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[locationService] ===== ERROR CREATING PROVINCE =====');
        console.error('[locationService] Error object:', error);
        console.error('[locationService] Error message:', error.message);
        console.error('[locationService] Error response status:', error.response?.status);
        console.error('[locationService] Error response data (full):', JSON.stringify(error.response?.data, null, 2));
        console.error('[locationService] Error response headers:', error.response?.headers);
        console.error('[locationService] Request config:', {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
        });
        console.error('[locationService] Request Body (đã gửi lên backend):', error.config?.data ? JSON.parse(error.config.data) : requestBody);
        console.error('[locationService] Request Body (JSON string):', error.config?.data || JSON.stringify(requestBody, null, 2));
        console.error('[locationService] ===== END ERROR DETAILS =====');
        
        // Log riêng để dễ copy-paste cho backend team
        console.error('[locationService] ===== COPY THIS FOR BACKEND TEAM =====');
        console.error('[locationService] REQUEST BODY:');
        console.error(JSON.stringify(requestBody, null, 2));
        console.error('[locationService] BACKEND RESPONSE:');
        console.error(JSON.stringify(error.response?.data || { message: error.message }, null, 2));
        console.error('[locationService] HTTP STATUS:', error.response?.status || 'N/A');
        console.error('[locationService] ===== END COPY =====');
        
        // Xử lý error message chi tiết hơn
        let errorMessage = 'Không thể tạo tỉnh/thành phố mới';
        let isFromBackend = false;
        let backendMessage = '';
        
        // Kiểm tra response từ backend
        if (error.response?.data) {
            isFromBackend = true;
            backendMessage = error.response.data.message || JSON.stringify(error.response.data);
            console.log('[locationService] ✅ ERROR TỪ BACKEND:', backendMessage);
            console.log('[locationService] Backend statusCode:', error.response.data.statusCode);
            console.log('[locationService] Backend error type:', error.response.data.errorType || 'N/A');
            
            if (error.response.data.message) {
                const msg = error.response.data.message;
                if (msg.includes('Province already exists') || msg.includes('PROVINCE_EXISTS')) {
                    // Backend xác nhận province đã tồn tại
                    errorMessage = 'Tỉnh/thành phố đã tồn tại trong hệ thống. Vui lòng kiểm tra:\n\n' +
                        `- Tên "${name}" đã được sử dụng\n` +
                        `- Mã "${code}" đã được sử dụng\n\n` +
                        'Vui lòng thử tên/mã khác hoặc kiểm tra lại danh sách.';
                } else {
                    // Dùng message từ backend
                    errorMessage = msg;
                }
            }
        } else if (error.message) {
            console.log('[locationService] ⚠️ ERROR TỪ FRONTEND (network/timeout/etc):', error.message);
            errorMessage = error.message;
        }
        
        console.log('[locationService] Final error message:', errorMessage);
        console.log('[locationService] Error source:', isFromBackend ? 'BACKEND' : 'FRONTEND/NETWORK');
        
        throw new Error(errorMessage);
    }
};

