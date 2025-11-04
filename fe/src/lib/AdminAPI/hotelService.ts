// lib/AdminAPI/hotelService.ts
import type { Hotel, HotelStatus } from "@/types";
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

// Interface từ API response
interface HotelResponse {
    id: string;
    name: string;
    description?: string;
    address: string;
    location?: {
        country?: { id: string; name: string };
        province?: { id: string; name: string };
        city?: { id: string; name: string };
        district?: { id: string; name: string };
        ward?: { id: string; name: string };
        street?: { id: string; name: string };
    };
    // Cũng hỗ trợ format trực tiếp (nếu API trả về)
    country?: { id: string; name: string };
    province?: { id: string; name: string };
    city?: { id: string; name: string };
    district?: { id: string; name: string };
    ward?: { id: string; name: string };
    street?: { id: string; name: string };
    starRating?: number;
    status: string;
    amenities?: Array<{ id: string; name: string }>;
    photos?: Array<{ id: string; url: string; category?: string }>;
    partner?: { id: string; name?: string; fullName?: string; email?: string };
    partnerId?: string; // Nếu API trả về partnerId trực tiếp
    createdAt?: string;
    updatedAt?: string;
}

interface PaginatedHotelResponse {
    content: HotelResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Helper function để map từ HotelResponse sang Hotel
function mapHotelResponseToHotel(response: HotelResponse): Hotel {
    console.log("[mapHotelResponseToHotel] Mapping response:", JSON.stringify(response, null, 2));

    // Lấy ảnh đầu tiên làm imageUrl
    let imageUrl: string | undefined = undefined;

    console.log("[mapHotelResponseToHotel] Checking photos:", response.photos);

    if (response.photos && Array.isArray(response.photos) && response.photos.length > 0) {
        const firstPhoto = response.photos[0];
        console.log("[mapHotelResponseToHotel] First photo:", firstPhoto);

        // Kiểm tra nếu photos có cấu trúc { id, url }
        if (typeof firstPhoto === 'object' && firstPhoto !== null && 'url' in firstPhoto) {
            imageUrl = (firstPhoto as any).url;
            console.log("[mapHotelResponseToHotel] Extracted imageUrl from photo.url:", imageUrl);
        }
        // Nếu photos có cấu trúc nested như { id, name, photos: [{ id, url }] }
        else if (typeof firstPhoto === 'object' && firstPhoto !== null && 'photos' in firstPhoto && Array.isArray((firstPhoto as any).photos)) {
            const nestedPhotos = (firstPhoto as any).photos as Array<{ id: string; url: string }>;
            if (nestedPhotos.length > 0 && nestedPhotos[0].url) {
                imageUrl = nestedPhotos[0].url;
                console.log("[mapHotelResponseToHotel] Extracted imageUrl from nested photos:", imageUrl);
            }
        } else {
            console.warn("[mapHotelResponseToHotel] Unexpected photo structure:", firstPhoto);
        }
    } else {
        console.log("[mapHotelResponseToHotel] No photos found or empty photos array");
    }

    console.log("[mapHotelResponseToHotel] Final imageUrl:", imageUrl);

    // Build địa chỉ đầy đủ từ location
    let fullAddress = response.address;

    // Lấy location từ response.location hoặc từ các field trực tiếp
    const location = response.location || {
        country: response.country,
        province: response.province,
        city: response.city,
        district: response.district,
        ward: response.ward,
        street: response.street,
    };

    if (location) {
        const addressParts: string[] = [];

        if (location.street?.name) addressParts.push(location.street.name);
        if (location.ward?.name) addressParts.push(location.ward.name);
        if (location.district?.name) addressParts.push(location.district.name);
        if (location.city?.name) addressParts.push(location.city.name);
        if (location.province?.name) addressParts.push(location.province.name);

        if (addressParts.length > 0) {
            fullAddress = `${response.address}, ${addressParts.join(', ')}`;
        } else {
            fullAddress = response.address;
        }
    }

    // Xử lý status - đảm bảo luôn có giá trị hợp lệ
    let mappedStatus: HotelStatus = 'ACTIVE'; // Mặc định là ACTIVE nếu không có status

    if (response.status) {
        const statusUpper = response.status.toUpperCase();
        if (statusUpper === 'ACTIVE' || statusUpper === 'PENDING' || statusUpper === 'HIDDEN') {
            mappedStatus = statusUpper as HotelStatus;
        } else {
            // Nếu status không hợp lệ, mặc định là ACTIVE (vì khách sạn đã được đăng)
            mappedStatus = 'ACTIVE';
        }
    }

    // Map ownerId từ partner hoặc partnerId
    let ownerId: string | undefined = undefined;
    if (response.partner?.id) {
        ownerId = response.partner.id;
    } else if (response.partnerId) {
        ownerId = response.partnerId;
    }
    
    console.log("[mapHotelResponseToHotel] Partner info:", {
        partner: response.partner,
        partnerId: response.partnerId,
        mappedOwnerId: ownerId
    });

    return {
        id: response.id,
        name: response.name,
        address: fullAddress,
        status: mappedStatus,
        description: response.description,
        imageUrl: imageUrl,
        ownerId: ownerId, // Map partner.id hoặc partnerId sang ownerId
    };
}

const baseURL = '/accommodation/hotels';

/**
 * Interface cho paginated response
 */
export interface PaginatedHotelData {
    hotels: Hotel[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

/**
 * Lấy danh sách khách sạn với phân trang (dành cho admin)
 */
export const getHotels = async (
    page: number = 0,
    size: number = 10,
    cityId?: string,
    provinceId?: string,
    userId?: string, // Thêm userId để filter theo owner (nếu role là PARTNER)
    roleName?: string // Thêm roleName để biết có cần filter theo owner không
): Promise<PaginatedHotelData> => {
    try {
        console.log(`[hotelService] Fetching hotels - page: ${page}, size: ${size}, cityId: ${cityId}, provinceId: ${provinceId}, userId: ${userId}, role: ${roleName}`);

        const params: any = {
            page,
            size,
            'sort-by': 'createdAt', // Backend dùng "sort-by" (kebab-case)
            'sort-dir': 'DESC'      // Backend dùng "sort-dir" (kebab-case)
        };

        // Thêm filter theo location - ƯU TIÊN cityId
        // Backend sử dụng kebab-case: "city-id", "province-id"
        // Nếu có cityId thì chỉ filter theo cityId (không gửi provinceId)
        // Nếu không có cityId nhưng có provinceId thì filter theo provinceId
        if (cityId && cityId.trim() !== '') {
            params['city-id'] = cityId.trim(); // Backend dùng "city-id" (kebab-case)
            // KHÔNG gửi provinceId khi đã có cityId để tránh conflict
        } else if (provinceId && provinceId.trim() !== '') {
            params['province-id'] = provinceId.trim(); // Backend dùng "province-id" (kebab-case)
        }

        // Nếu role là PARTNER, filter hotels theo owner (partnerId)
        // Hoặc nếu là ADMIN và có userId, cũng filter theo partner-id
        // Backend dùng "partner-id" (kebab-case) theo CommonParams.PARTNER_ID
        if (userId && (roleName?.toLowerCase() === 'partner' || roleName?.toLowerCase() === 'admin')) {
            params['partner-id'] = userId.trim(); // Kebab-case (theo backend CommonParams)
            console.log(`[hotelService] Filtering hotels by partner-id (owner): ${userId} for role: ${roleName}`);
        }

        console.log("[hotelService] Request params:", JSON.stringify(params, null, 2));
        console.log("[hotelService] Full URL will be:", baseURL, "with params:", Object.keys(params));

        const response = await apiClient.get<ApiResponse<PaginatedHotelResponse>>(
            baseURL,
            {
                params
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const paginatedData = response.data.data;
            
            // Debug: Log raw response để kiểm tra partner info
            console.log(`[hotelService] Raw response sample (first hotel):`, paginatedData.content[0] ? {
                id: paginatedData.content[0].id,
                name: paginatedData.content[0].name,
                partner: paginatedData.content[0].partner,
                partnerId: (paginatedData.content[0] as any).partnerId,
            } : 'No hotels');
            
            const hotels = paginatedData.content.map(mapHotelResponseToHotel);
            
            // Debug: Log mapped hotels với ownerId
            console.log(`[hotelService] Mapped hotels with ownerId:`, hotels.map(h => ({
                id: h.id,
                name: h.name,
                ownerId: h.ownerId
            })));

            console.log(`[hotelService] Fetched ${hotels.length} hotels (page ${page + 1}/${paginatedData.totalPages})`);

            return {
                hotels,
                page: paginatedData.page,
                size: paginatedData.size,
                totalItems: paginatedData.totalItems,
                totalPages: paginatedData.totalPages,
                first: paginatedData.first,
                last: paginatedData.last,
                hasNext: paginatedData.hasNext,
                hasPrevious: paginatedData.hasPrevious,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[hotelService] Error fetching hotels:", error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách khách sạn');
    }
};

/**
 * Interface cho HotelDetailsResponse (có partner đầy đủ)
 * Partner là UserBriefResponse từ backend: { id, email, fullName, role }
 */
interface HotelDetailsResponse extends HotelResponse {
    partner?: { 
        id: string; 
        fullName: string;  // Backend dùng fullName
        email: string;
        role?: { id: string; name: string; };
    };
}

/**
 * Lấy một khách sạn theo ID (detail API - có partner info)
 */
export const getHotelById = async (id: string): Promise<Hotel | null> => {
    try {
        console.log(`[hotelService] Fetching hotel detail with id: ${id}`);

        const response = await apiClient.get<ApiResponse<HotelDetailsResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const detailData = response.data.data;
            
            // Debug: Log partner info từ detail API
            console.log(`[hotelService] Hotel detail ${id} - partner info:`, {
                partner: detailData.partner,
                partnerId: detailData.partner?.id,
                partnerFullName: detailData.partner?.fullName,
                partnerEmail: detailData.partner?.email,
            });
            
            // Map hotel với partner info
            const mappedHotel = mapHotelResponseToHotel(detailData);
            
            // Nếu có partner trong detail response, lưu vào hotel object (tạm thời dùng ownerId để lưu)
            // Hoặc có thể extend Hotel type để có partnerInfo
            console.log(`[hotelService] Mapped hotel with ownerId: ${mappedHotel.ownerId}`);
            
            return mappedHotel;
        }

        return null;
    } catch (error: any) {
        console.error(`[hotelService] Error fetching hotel ${id}:`, error);
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin khách sạn');
    }
};

/**
 * Tạo khách sạn mới
 * API yêu cầu JSON body, không phải multipart
 */
interface CreateHotelPayload {
    name: string;
    description: string;
    address: string;
    countryId: string;
    provinceId: string;
    cityId: string;
    districtId: string;
    wardId: string;
    streetId: string;
    partnerId: string;
}

/**
 * Create hotel - Client version (dùng apiClient với token từ localStorage)
 */
export const createHotel = async (payload: CreateHotelPayload): Promise<Hotel> => {
    try {
        console.log("[hotelService] Creating new hotel with payload:", JSON.stringify(payload, null, 2));
        console.log("[hotelService] API URL:", baseURL);
        console.log("[hotelService] Full URL:", `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${baseURL}`);

        const response = await apiClient.post<ApiResponse<HotelResponse>>(
            baseURL,
            payload
        );

        console.log("[hotelService] Response received:", {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
            statusCode: response.data?.statusCode,
            message: response.data?.message,
            hasData: !!response.data?.data,
        });

        if (response.data.statusCode === 200 && response.data.data) {
            console.log("[hotelService] Hotel created successfully:", response.data.data.id);
            return mapHotelResponseToHotel(response.data.data);
        }

        // Nếu response không có statusCode 200 hoặc không có data
        console.error("[hotelService] Invalid response structure:", {
            statusCode: response.data?.statusCode,
            message: response.data?.message,
            hasData: !!response.data?.data,
            responseData: response.data,
        });

        throw new Error(response.data?.message || 'Invalid response from server');
    } catch (error: any) {
        console.error("[hotelService] Error creating hotel - Full error:", error);
        console.error("[hotelService] Error type:", error.constructor?.name);
        console.error("[hotelService] Error response:", error.response);
        console.error("[hotelService] Error response data:", error.response?.data);
        console.error("[hotelService] Error response status:", error.response?.status);
        console.error("[hotelService] Error response headers:", error.response?.headers);
        console.error("[hotelService] Error config:", error.config);

        // Extract detailed error message
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.response?.data?.data?.message
            || error.message
            || 'Không thể tạo khách sạn';

        console.error("[hotelService] Final error message:", errorMessage);

        throw new Error(errorMessage);
    }
};

/**
 * Create hotel - Server version (dùng serverApiClient với token từ cookies)
 * Dùng trong server actions
 */
export const createHotelServer = async (payload: CreateHotelPayload): Promise<Hotel> => {
    try {
        console.log("[hotelService] Creating new hotel (server) with payload:", JSON.stringify(payload, null, 2));

        const serverClient = await createServerApiClient();

        const url = baseURL;
        console.log("[hotelService] Making POST request to:", url);
        console.log("[hotelService] Request payload:", JSON.stringify(payload, null, 2));

        let response;
        try {
            response = await serverClient.post(url, payload);
            console.log("[hotelService] Raw response received:", {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                hasData: !!response.data,
                dataType: typeof response.data,
                dataKeys: response.data ? Object.keys(response.data) : [],
            });
        } catch (requestError: any) {
            console.error("[hotelService] Request failed:", {
                message: requestError.message,
                code: requestError.code,
                response: requestError.response ? {
                    status: requestError.response.status,
                    statusText: requestError.response.statusText,
                    data: requestError.response.data,
                    headers: requestError.response.headers,
                } : null,
                config: requestError.config ? {
                    url: requestError.config.url,
                    method: requestError.config.method,
                    headers: requestError.config.headers,
                } : null,
            });
            throw requestError;
        }

        // Log toàn bộ response để debug (không dùng JSON.stringify vì có circular reference)
        console.log("[hotelService] response.data:", response.data);
        console.log("[hotelService] response.data type:", typeof response.data);

        // Chỉ stringify response.data (không stringify toàn bộ response object)
        try {
            console.log("[hotelService] response.data stringified:", JSON.stringify(response.data, null, 2));
        } catch (e) {
            console.log("[hotelService] Cannot stringify response.data:", e);
        }

        // Kiểm tra response structure
        if (!response || !response.data) {
            console.error("[hotelService] Response or response.data is missing");
            console.error("[hotelService] Full response object:", response);
            throw new Error('API response không có dữ liệu');
        }

        // Kiểm tra nếu response.data là object và có statusCode
        const responseData = response.data as any;

        if (responseData.statusCode !== 200) {
            console.error("[hotelService] API returned non-200 statusCode:", responseData.statusCode);
            console.error("[hotelService] Response message:", responseData.message);
            throw new Error(responseData.message || `API trả về statusCode ${responseData.statusCode}`);
        }

        if (!responseData.data) {
            console.error("[hotelService] Response data.data is null/undefined");
            console.error("[hotelService] Full response data:", JSON.stringify(responseData, null, 2));
            throw new Error(responseData.message || 'API trả về data null');
        }

        console.log("[hotelService] Hotel created successfully (server):", responseData.data.id);
        console.log("[hotelService] Hotel data:", JSON.stringify(responseData.data, null, 2));
        return mapHotelResponseToHotel(responseData.data);
    } catch (error: any) {
        console.error("[hotelService] Error creating hotel (server):", error);
        console.error("[hotelService] Error stack:", error.stack);
        console.error("[hotelService] Error details:", {
            message: error.message,
            responseStatus: error.response?.status,
            responseData: error.response?.data,
            responseHeaders: error.response?.headers,
            requestUrl: error.config?.url,
            requestMethod: error.config?.method,
        });

        // Xử lý các lỗi cụ thể
        let errorMessage = 'Không thể tạo khách sạn';
        
        if (error.response?.status === 409) {
            errorMessage = 'Khách sạn với tên này đã tồn tại. Vui lòng chọn tên khác.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
};

/**
 * Cập nhật khách sạn
 * Note: API yêu cầu multipart/form-data
 */
export const updateHotel = async (id: string, formData: FormData): Promise<Hotel> => {
    try {
        console.log(`[hotelService] Updating hotel ${id}...`);

        const response = await apiClient.put<ApiResponse<HotelResponse>>(
            `${baseURL}/${id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            console.log("[hotelService] Hotel updated successfully:", response.data.data.id);
            return mapHotelResponseToHotel(response.data.data);
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[hotelService] Error updating hotel ${id}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật khách sạn');
    }
};

/**
 * Xóa khách sạn
 */
export const deleteHotel = async (id: string): Promise<{ success: boolean }> => {
    try {
        console.log(`[hotelService] Deleting hotel with id: ${id}`);

        const response = await apiClient.delete<ApiResponse<HotelResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200) {
            console.log("[hotelService] Hotel deleted successfully");
            return { success: true };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[hotelService] Error deleting hotel ${id}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể xóa khách sạn');
    }
};
