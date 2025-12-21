// lib/AdminAPI/locationService.ts
import apiClient, { ApiResponse } from "@/service/apiClient";
import { API_BASE_URL } from "@/config/api.config";

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

        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        return response.data.data || [];
    } catch (error) {
        return [];
    }
};

// Get cities by provinceId (hoặc lấy tất cả nếu không có provinceId)
// Hàm này dùng cho CLIENT-SIDE (browser)
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

        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        return response.data.data || [];
    } catch (error) {
        return [];
    }
};

// Get cities cho SERVER-SIDE (Next.js Server Component)
// Sử dụng axios trực tiếp vì không có localStorage/cookies ở server
export const getCitiesServer = async (provinceId?: string, name?: string): Promise<LocationOption[]> => {
    try {
        const axios = (await import('axios')).default;

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

        const fullUrl = `${API_BASE_URL}${url}`;

        const response = await axios.get<ApiResponse<LocationOption[]>>(fullUrl, {
            timeout: 10000, // 10 seconds timeout
            withCredentials: true, // QUAN TRỌNG: Cho phép gửi cookies (cần thiết cho CORS)
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data.data || [];
    } catch (error: any) {
        // Chỉ log lỗi nếu không phải ECONNREFUSED (backend không chạy là expected trong dev)
        if (error.code !== 'ECONNREFUSED' && error.code !== 'ETIMEDOUT') {
        }
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

        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const districts = response.data.data || [];

        return districts;
    } catch (error: any) {
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

        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const wards = response.data.data || [];

        return wards;
    } catch (error: any) {
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

        const response = await apiClient.get<ApiResponse<LocationOption[]>>(url);
        const streets = response.data.data || [];

        return streets;
    } catch (error: any) {
        return [];
    }
};

// ==================== CREATE LOCATION FUNCTIONS ====================

/**
 * Tạo Street mới
 */
export const createStreet = async (name: string, wardId: string, code: string): Promise<LocationOption> => {
    // Đường cần mã code (backend yêu cầu)
    const requestBody: {
        name: string;
        code: string;
        wardId: string;
    } = {
        name: name.trim(),
        code: code.trim(),
        wardId: wardId.trim(),
    };

    try {
        const response = await apiClient.post<ApiResponse<any>>('/location/streets', requestBody);

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            return result;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo đường mới';
        throw new Error(errorMessage);
    }
};

/**
 * Tạo Ward mới
 */
export const createWard = async (name: string, districtId: string, code: string): Promise<LocationOption> => {
    // Phường/Xã cần mã code (backend yêu cầu)
    const requestBody: {
        name: string;
        code: string;
        districtId: string;
    } = {
        name: name.trim(),
        code: code.trim(),
        districtId: districtId.trim(),
    };

    try {
        const response = await apiClient.post<ApiResponse<any>>('/location/wards', requestBody);

        // Kiểm tra HTTP status trước - nếu 200/201 thì coi như thành công
        if (response.status === 200 || response.status === 201) {
            let result: LocationOption | null = null;

            // Case 1: Standard format: { statusCode: 200, data: { id, name, code } }
            if (response.data?.statusCode === 200 && response.data?.data) {
                const data = response.data.data;
                if (data.id) {
                    result = {
                        id: data.id,
                        name: data.name || name,
                        code: data.code,
                    };
                }
            }
            // Case 2: Response có id trực tiếp trong response.data (không phải ApiResponse structure)
            else if (response.data && typeof response.data === 'object' && 'id' in response.data && !('statusCode' in response.data)) {
                const data = response.data as any;
                result = {
                    id: String(data.id),
                    name: String(data.name || name),
                    code: data.code ? String(data.code) : undefined,
                };
            }
            // Case 3: Response.data.data chính là location object (nested)
            else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                const nestedData = (response.data as any).data;
                if (nestedData && typeof nestedData === 'object' && 'id' in nestedData) {
                    result = {
                        id: String(nestedData.id),
                        name: String(nestedData.name || name),
                        code: nestedData.code ? String(nestedData.code) : undefined,
                    };
                }
            }

            if (result) {
                return result;
            } else {
                throw new Error('Tạo thành công nhưng không nhận được thông tin phản hồi. Vui lòng kiểm tra lại danh sách.');
            }
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {

        let errorMessage = 'Không thể tạo phường/xã mới';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        if (errorMessage === 'Không thể tạo phường/xã mới' && (error.response?.status === 200 || error.response?.status === 201)) {
            errorMessage = 'Tạo thành công nhưng không nhận được phản hồi. Vui lòng kiểm tra lại danh sách.';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Tạo District mới
 */
export const createDistrict = async (name: string, cityId: string, code: string): Promise<LocationOption> => {
    // Quận/Huyện cần mã code (backend yêu cầu)
    const requestBody: {
        name: string;
        code: string;
        cityId: string;
    } = {
        name: name.trim(),
        code: code.trim(),
        cityId: cityId.trim(),
    };

    try {
        let response;
        try {
            response = await apiClient.post<ApiResponse<any>>('/location/districts', requestBody);
        } catch (apiError: any) {
            throw apiError;
        }

        // Kiểm tra HTTP status trước - nếu 200/201 thì coi như thành công
        if (response.status === 200 || response.status === 201) {
            let result: LocationOption | null = null;

            // Case 1: Standard format: { statusCode: 200, data: { id, name, code } }
            if (response.data?.statusCode === 200 && response.data?.data) {
                const data = response.data.data;
                if (data.id) {
                    result = {
                        id: data.id,
                        name: data.name || name,
                        code: data.code,
                    };
                }
            }
            // Case 2: Response có id trực tiếp trong response.data (không phải ApiResponse structure)
            else if (response.data && typeof response.data === 'object' && 'id' in response.data && !('statusCode' in response.data)) {
                const data = response.data as any;
                result = {
                    id: String(data.id),
                    name: String(data.name || name),
                    code: data.code ? String(data.code) : undefined,
                };
            }
            // Case 3: Response.data.data chính là location object (nested)
            else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                const nestedData = (response.data as any).data;
                if (nestedData && typeof nestedData === 'object' && 'id' in nestedData) {
                    result = {
                        id: String(nestedData.id),
                        name: String(nestedData.name || name),
                        code: nestedData.code ? String(nestedData.code) : undefined,
                    };
                }
            }

            if (result) {
                return result;
            } else {
                throw new Error('Tạo thành công nhưng không nhận được thông tin phản hồi. Vui lòng kiểm tra lại danh sách.');
            }
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {

        // Xử lý error message - kiểm tra nhiều nguồn
        let errorMessage = 'Không thể tạo quận/huyện mới';

        if (error.response?.data) {
            // Backend có response
            if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else {
                // Backend trả về error nhưng không có message field
                errorMessage = JSON.stringify(error.response.data);
            }
        } else if (error.message) {
            // Network error hoặc error không có response
            errorMessage = error.message;
        }

        // Nếu errorMessage vẫn là default và có response 200/201, có thể là parse error
        if (errorMessage === 'Không thể tạo quận/huyện mới' && (error.response?.status === 200 || error.response?.status === 201)) {
            errorMessage = 'Tạo thành công nhưng không nhận được phản hồi. Vui lòng kiểm tra lại danh sách.';
        }

        throw new Error(errorMessage);
    }
};

/**
 * Tạo City mới
 */
export const createCity = async (name: string, code: string, provinceId: string): Promise<LocationOption> => {
    const requestBody = {
        name: name.trim(),
        code: code.trim() || '',
        provinceId: provinceId.trim(),
    };

    try {
        const response = await apiClient.post<ApiResponse<any>>('/location/cities', requestBody);

        // Kiểm tra HTTP status trước - nếu 200/201 thì coi như thành công
        if (response.status === 200 || response.status === 201) {
            // Kiểm tra response structure - có thể backend trả về format khác
            let result: LocationOption | null = null;

            // Case 1: Standard format: { statusCode: 200, data: { id, name, code } }
            if (response.data?.statusCode === 200 && response.data?.data) {
                const data = response.data.data;
                if (data.id) {
                    result = {
                        id: data.id,
                        name: data.name || name,
                        code: data.code || code,
                    };
                }
            }
            // Case 2: Response có id trực tiếp trong response.data (không phải ApiResponse structure)
            else if (response.data && typeof response.data === 'object' && 'id' in response.data && !('statusCode' in response.data)) {
                const data = response.data as any;
                result = {
                    id: String(data.id),
                    name: String(data.name || name),
                    code: data.code ? String(data.code) : code,
                };
            }
            // Case 3: Response.data.data chính là location object (nested)
            else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
                const nestedData = (response.data as any).data;
                if (nestedData && typeof nestedData === 'object' && 'id' in nestedData) {
                    result = {
                        id: String(nestedData.id),
                        name: String(nestedData.name || name),
                        code: nestedData.code ? String(nestedData.code) : code,
                    };
                }
            }

            if (result) {
                return result;
            } else {
                throw new Error('Tạo thành công nhưng không nhận được thông tin phản hồi. Vui lòng kiểm tra lại danh sách.');
            }
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {

        let errorMessage = 'Không thể tạo thành phố/quận mới';
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        if (errorMessage === 'Không thể tạo thành phố/quận mới' && (error.response?.status === 200 || error.response?.status === 201)) {
            errorMessage = 'Tạo thành công nhưng không nhận được phản hồi. Vui lòng kiểm tra lại danh sách.';
        }

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
        const response = await apiClient.post<ApiResponse<any>>('/location/provinces', requestBody);

        if (response.data.statusCode === 200 && response.data.data) {
            const data = response.data.data;
            const result: LocationOption = {
                id: data.id,
                name: data.name,
                code: data.code,
            };
            return result;
        }
        throw new Error('Invalid response from server');
    } catch (error: any) {

        // Xử lý error message chi tiết hơn
        let errorMessage = 'Không thể tạo tỉnh/thành phố mới';
        let isFromBackend = false;
        let backendMessage = '';

        // Kiểm tra response từ backend
        if (error.response?.data) {
            isFromBackend = true;
            backendMessage = error.response.data.message || JSON.stringify(error.response.data);

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
            errorMessage = error.message;
        }


        throw new Error(errorMessage);
    }
};

