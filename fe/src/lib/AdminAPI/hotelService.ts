// lib/AdminAPI/hotelService.ts
import type { Hotel, HotelStatus } from "@/types";
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

// Interface cho Policy
interface HotelPolicyResponse {
    id: string;
    checkInTime: string;
    checkOutTime: string;
    allowsPayAtHotel: boolean;
    requiredIdentificationDocuments?: Array<{
        id: string;
        name: string;
    }>;
    cancellationPolicy?: {
        id: string;
        name: string;
        description: string;
        rules?: Array<{
            id: string;
            daysBeforeCheckIn: number;
            penaltyPercentage: number;
        }>;
    };
    reschedulePolicy?: {
        id: string;
        name: string;
        description: string;
        rules?: Array<{
            id: string;
            daysBeforeCheckin: number;
            feePercentage: number;
        }>;
    };
}

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
    amenities?: Array<{ id: string; name: string }> | Array<{
        id: string;
        name: string;
        amenities?: Array<{ id: string; name: string }>;
    }>;
    photos?: Array<{ id: string; url: string; category?: string }>;
    partner?: { id: string; name?: string; fullName?: string; email?: string };
    partnerId?: string; // Nếu API trả về partnerId trực tiếp
    policy?: HotelPolicyResponse | null;
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

    // Build địa chỉ đầy đủ từ location (KHÔNG dùng response.address để tránh lặp)
    // Backend có thể đã tự động ghép address từ location, nên chỉ dùng location fields
    const location = response.location || {
        country: response.country,
        province: response.province,
        city: response.city,
        district: response.district,
        ward: response.ward,
        street: response.street,
    };

    let fullAddress = '';
    if (location) {
        const addressParts: string[] = [];

        // Chỉ lấy address từ response nếu nó không chứa location info (tránh lặp)
        const responseAddress = response.address || '';
        if (responseAddress && 
            responseAddress.trim() !== '' && 
            responseAddress !== 'Chưa có địa chỉ') {
            // Kiểm tra xem address có chứa street name không (để tránh lặp)
            const streetName = location.street?.name || '';
            if (!streetName || !responseAddress.includes(streetName)) {
                // Address không chứa street name, có thể là địa chỉ cụ thể (số nhà, tên đường)
                addressParts.push(responseAddress);
            }
        }

        // Thêm location fields
        if (location.street?.name) addressParts.push(location.street.name);
        // Chỉ lấy ward nếu ward khác district (tránh lặp)
        if (location.ward?.name && location.ward.name !== location.district?.name) {
            addressParts.push(location.ward.name);
        }
        if (location.district?.name) addressParts.push(location.district.name);
        if (location.city?.name) addressParts.push(location.city.name);
        // Không thêm province để tránh dài dòng

        fullAddress = addressParts.length > 0 ? addressParts.join(', ') : (response.address || 'Chưa có địa chỉ');
    } else {
        fullAddress = response.address || 'Chưa có địa chỉ';
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
    let ownerName: string | undefined = undefined;
    let ownerEmail: string | undefined = undefined;
    
    if (response.partner?.id) {
        ownerId = response.partner.id;
        ownerName = response.partner.fullName || response.partner.name;
        ownerEmail = response.partner.email;
    } else if (response.partnerId) {
        ownerId = response.partnerId;
    }
    
    console.log("[mapHotelResponseToHotel] Partner info:", {
        partner: response.partner,
        partnerId: response.partnerId,
        mappedOwnerId: ownerId,
        ownerName: ownerName
    });

    return {
        id: response.id,
        name: response.name,
        address: fullAddress,
        status: mappedStatus,
        description: response.description,
        imageUrl: imageUrl,
        ownerId: ownerId, // Map partner.id hoặc partnerId sang ownerId
        ownerName: ownerName, // Lưu tên partner nếu có từ list response
        ownerEmail: ownerEmail, // Lưu email partner nếu có từ list response
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
    policy?: HotelPolicyResponse | null;
    amenities?: Array<{
        id: string;
        name: string;
        amenities?: Array<{ id: string; name: string }>;
    }>;
}

// Export policy interface để dùng ở nơi khác
export type { HotelPolicyResponse };

/**
 * Lấy một khách sạn theo ID (detail API - có partner info) - Server version
 * Dùng serverApiClient với token từ cookies (dành cho server components)
 */
export const getHotelByIdServer = async (id: string): Promise<Hotel | null> => {
    try {
        console.log(`[hotelService] [SERVER] Fetching hotel detail with id: ${id}`);

        const serverClient = await createServerApiClient();
        const response = await serverClient.get<ApiResponse<HotelDetailsResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const detailData = response.data.data;
            
            // Debug: Log partner info từ detail API
            console.log(`[hotelService] [SERVER] Hotel detail ${id} - partner info:`, {
                partner: detailData.partner,
                partnerId: detailData.partner?.id,
                partnerFullName: detailData.partner?.fullName,
                partnerEmail: detailData.partner?.email,
            });
            
            // Map hotel với partner info
            const mappedHotel = mapHotelResponseToHotel(detailData);
            
            console.log(`[hotelService] [SERVER] Mapped hotel with ownerId: ${mappedHotel.ownerId}`);
            
            return mappedHotel;
        }

        return null;
    } catch (error: any) {
        console.error(`[hotelService] [SERVER] Error fetching hotel ${id}:`, error);
        if (error.response?.status === 404) {
            return null;
        }
        // Nếu là lỗi authentication, throw error rõ ràng
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin khách sạn');
    }
};

/**
 * Lấy một khách sạn theo ID (detail API - có partner info) - Client version
 * Dùng apiClient với token từ localStorage (dành cho client components)
 */
export const getHotelById = async (id: string): Promise<Hotel | null> => {
    try {
        console.log(`[hotelService] [CLIENT] Fetching hotel detail with id: ${id}`);

        const response = await apiClient.get<ApiResponse<HotelDetailsResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const detailData = response.data.data;
            
            // Debug: Log partner info từ detail API
            console.log(`[hotelService] [CLIENT] Hotel detail ${id} - partner info:`, {
                partner: detailData.partner,
                partnerId: detailData.partner?.id,
                partnerFullName: detailData.partner?.fullName,
                partnerEmail: detailData.partner?.email,
            });
            
            // Map hotel với partner info
            const mappedHotel = mapHotelResponseToHotel(detailData);
            
            // Nếu có partner trong detail response, lưu vào hotel object (tạm thời dùng ownerId để lưu)
            // Hoặc có thể extend Hotel type để có partnerInfo
            console.log(`[hotelService] [CLIENT] Mapped hotel with ownerId: ${mappedHotel.ownerId}`);
            
            return mappedHotel;
        }

        return null;
    } catch (error: any) {
        console.error(`[hotelService] [CLIENT] Error fetching hotel ${id}:`, error);
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin khách sạn');
    }
};

/**
 * Lấy thông tin chi tiết khách sạn với policy và amenities (dùng cho detail page)
 */
export const getHotelDetailById = async (id: string): Promise<HotelDetailsResponse | null> => {
    try {
        console.log(`[hotelService] Fetching hotel detail with policy and amenities for id: ${id}`);

        const response = await apiClient.get<ApiResponse<HotelDetailsResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return null;
    } catch (error: any) {
        console.error(`[hotelService] Error fetching hotel detail ${id}:`, error);
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
 * @param payload - Thông tin khách sạn
 * @param images - Mảng các file ảnh (optional)
 */
export const createHotelServer = async (payload: CreateHotelPayload, images: File[] = []): Promise<Hotel> => {
    try {
        console.log("[hotelService] Creating new hotel (server) with payload:", JSON.stringify(payload, null, 2));
        console.log("[hotelService] Images to upload:", images.length);

        const serverClient = await createServerApiClient();

        const url = baseURL;
        console.log("[hotelService] Making POST request to:", url);

        let response;
        try {
            // Backend chỉ nhận JSON khi tạo hotel (POST), không hỗ trợ multipart/form-data
            // Chỉ có update (PUT) mới hỗ trợ multipart
            // Vì vậy: Tạo hotel bằng JSON trước, sau đó update với ảnh (nếu có)
            console.log("[hotelService] Request payload (JSON):", JSON.stringify(payload, null, 2));
            response = await serverClient.post(url, payload);
            
            // Nếu có ảnh, update hotel với ảnh sau khi tạo thành công
            if (images.length > 0 && response.data?.data?.id) {
                const hotelId = response.data.data.id;
                console.log(`[hotelService] Hotel created with ID: ${hotelId}, now updating with ${images.length} images`);
                
                try {
                    // Tạo FormData cho update
                    const updateFormData = new FormData();
                    
                    // Append các field text (có thể để trống, chỉ cần ảnh)
                    updateFormData.append('name', payload.name);
                    updateFormData.append('description', payload.description);
                    updateFormData.append('address', payload.address);
                    updateFormData.append('countryId', payload.countryId);
                    updateFormData.append('provinceId', payload.provinceId);
                    updateFormData.append('cityId', payload.cityId);
                    updateFormData.append('districtId', payload.districtId);
                    updateFormData.append('wardId', payload.wardId);
                    updateFormData.append('streetId', payload.streetId);
                    updateFormData.append('partnerId', payload.partnerId);

                    // Fetch photo categories để tìm category cho "Khách sạn"
                    let photoCategoryId: string | null = null;
                    try {
                        const { getPhotoCategoriesServer } = await import('./photoCategoryService');
                        const categories = await getPhotoCategoriesServer();
                        const hotelCategory = categories.find(cat =>
                            cat.name.toLowerCase().includes('khách sạn') ||
                            cat.name.toLowerCase().includes('hotel') ||
                            cat.name.toLowerCase() === 'khách sạn'
                        );
                        if (hotelCategory) {
                            photoCategoryId = hotelCategory.id;
                            console.log(`[hotelService] Found photo category "Khách sạn": ${photoCategoryId}`);
                        } else if (categories.length > 0) {
                            // Fallback: dùng category đầu tiên
                            photoCategoryId = categories[0].id;
                            console.warn(`[hotelService] Could not find "Khách sạn" category, using first category: ${categories[0].name}`);
                        }
                    } catch (error) {
                        console.error('[hotelService] Error fetching photo categories:', error);
                        console.warn('[hotelService] Will proceed without photoCategoryId - backend may reject with validation error');
                    }

                    // Append các ảnh - Backend yêu cầu format: photosToAdd[0].files[0], photosToAdd[0].files[1], ...
                    // Backend expect 'photosToAdd' (List<PhotoCreationRequest>), không phải 'photos'
                    images.forEach((image, index) => {
                        updateFormData.append(`photosToAdd[0].files[${index}]`, image);
                    });

                    // Backend yêu cầu categoryId (@NotBlank trong PhotoCreationRequest)
                    if (photoCategoryId) {
                        updateFormData.append('photosToAdd[0].categoryId', photoCategoryId);
                        console.log(`[hotelService] Using photo category ID: ${photoCategoryId}`);
                    } else {
                        console.error('[hotelService] WARNING: No photoCategoryId - backend will reject with validation error');
                    }

                    // Update hotel với ảnh
                    console.log(`[hotelService] Updating hotel ${hotelId} with ${images.length} images`);
                    const updateResponse = await serverClient.put(`${url}/${hotelId}`, updateFormData);
                    console.log(`[hotelService] Hotel updated successfully with images`);
                    
                    // Cập nhật response với data từ update (có ảnh)
                    response = updateResponse;
                } catch (updateError: any) {
                    console.error('[hotelService] Error updating hotel with images:', updateError);
                    console.error('[hotelService] Update error details:', {
                        status: updateError.response?.status,
                        statusText: updateError.response?.statusText,
                        data: updateError.response?.data,
                        message: updateError.message,
                    });
                    
                    // Nếu là lỗi authentication (401/403), throw error để user biết
                    if (updateError.response?.status === 401 || updateError.response?.status === 403) {
                        throw new Error('Không có quyền cập nhật ảnh. Vui lòng đăng nhập lại.');
                    }
                    
                    // Nếu là lỗi khác, throw error với message cụ thể
                    const errorMessage = updateError.response?.data?.message || 
                                       updateError.response?.data?.error || 
                                       updateError.message || 
                                       'Không thể upload ảnh. Khách sạn đã được tạo nhưng chưa có ảnh.';
                    throw new Error(`Khách sạn đã được tạo nhưng upload ảnh thất bại: ${errorMessage}`);
                }
            }
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
        
        // Xử lý lỗi 403 (Forbidden) - Người dùng không có quyền
        if (error.response?.status === 403) {
            const backendMessage = error.response?.data?.message || error.response?.data?.error || '';
            if (backendMessage.includes('không được phép') || backendMessage.includes('not allowed') || backendMessage.includes('Forbidden')) {
                errorMessage = 'Người dùng không được phép truy cập vào tài nguyên này. Vui lòng kiểm tra quyền truy cập của tài khoản.';
            } else {
                errorMessage = backendMessage || 'Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra quyền truy cập.';
            }
        } else if (error.response?.status === 409) {
            errorMessage = 'Khách sạn với tên này đã tồn tại. Vui lòng chọn tên khác.';
        } else if (error.response?.status === 401) {
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error("[hotelService] Final error message:", errorMessage);
        console.error("[hotelService] Response status:", error.response?.status);
        console.error("[hotelService] Response data:", error.response?.data);
        
        throw new Error(errorMessage);
    }
};

/**
 * Cập nhật khách sạn - Client version (dùng apiClient với token từ localStorage)
 * Note: API yêu cầu multipart/form-data
 */
export const updateHotel = async (id: string, formData: FormData): Promise<Hotel> => {
    try {
        console.log(`[hotelService] Updating hotel ${id}...`);

        // KHÔNG set Content-Type header - axios sẽ tự động set với boundary cho FormData
        const response = await apiClient.put<ApiResponse<HotelResponse>>(
            `${baseURL}/${id}`,
            formData
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
 * Cập nhật khách sạn - Server version (dùng serverApiClient với token từ cookies)
 * Dùng trong server actions
 * Note: API yêu cầu multipart/form-data với format photos[0].files[0], photos[0].files[1], ...
 */
export const updateHotelServer = async (id: string, formData: FormData): Promise<Hotel> => {
    try {
        console.log(`[hotelService] Updating hotel ${id} (server)...`);

        const serverClient = await createServerApiClient();

        // Tạo FormData mới với format đúng cho backend
        const updateFormData = new FormData();

        // Copy các field text từ formData gốc
        const textFields = ['name', 'description', 'countryId', 'provinceId', 'cityId', 
                           'districtId', 'wardId', 'streetId', 'partnerId', 'stt'];
        const sentFields: string[] = [];
        textFields.forEach(field => {
            const value = formData.get(field);
            if (value !== null && value !== undefined) {
                const valueStr = value.toString().trim();
                // Cho phép gửi cả giá trị rỗng (backend có thể cần để clear field)
                // Nhưng bỏ qua nếu là null/undefined
                updateFormData.append(field, valueStr);
                sentFields.push(`${field}=${valueStr}`);
            }
        });

        // Chỉ gửi address nếu user thực sự nhập (không phải "Chưa có địa chỉ" hoặc rỗng)
        const addressValue = formData.get('address');
        if (addressValue && addressValue.toString().trim() !== '' && addressValue.toString().trim() !== 'Chưa có địa chỉ') {
            updateFormData.append('address', addressValue.toString().trim());
            sentFields.push(`address=${addressValue.toString().trim()}`);
        } else {
            console.log(`[hotelService] Skipping address field (empty or "Chưa có địa chỉ")`);
        }
        
        console.log(`[hotelService] FormData fields being sent:`, sentFields.join(', '));

        // Xử lý status riêng: Backend yêu cầu lowercase (active, inactive, maintenance, closed)
        // Frontend có thể gửi uppercase (ACTIVE, PENDING, HIDDEN) hoặc đã là lowercase
        const statusValue = formData.get('status');
        if (statusValue) {
            const statusStr = statusValue.toString().trim().toLowerCase();
            // Map các giá trị cũ sang giá trị mới nếu cần
            let mappedStatus = statusStr;
            if (statusStr === 'pending') {
                mappedStatus = 'active'; // PENDING -> active (hoặc inactive tùy logic)
            } else if (statusStr === 'hidden') {
                mappedStatus = 'inactive'; // HIDDEN -> inactive
            }
            
            // Validate status hợp lệ
            const validStatuses = ['active', 'inactive', 'maintenance', 'closed'];
            if (validStatuses.includes(mappedStatus)) {
                updateFormData.append('status', mappedStatus);
                console.log(`[hotelService] Status: ${statusStr} -> ${mappedStatus}`);
            } else {
                console.warn(`[hotelService] Invalid status: ${statusStr}, using 'active' as default`);
                updateFormData.append('status', 'active');
            }
        }

        // Xử lý ảnh: FormData từ form có field 'images', nhưng backend yêu cầu 'photos[0].files[0]', 'photos[0].files[1]', ...
        const images = formData.getAll('images') as File[];
        const validImages = images.filter((img) => img instanceof File && img.size > 0);

        if (validImages.length > 0) {
            console.log(`[hotelService] Updating hotel with ${validImages.length} images`);

            // Fetch photo category ID cho "Khách sạn"
            let photoCategoryId: string | null = null;
            try {
                const { getPhotoCategoriesServer } = await import('./photoCategoryService');
                const categories = await getPhotoCategoriesServer();
                const hotelCategory = categories.find(cat =>
                    cat.name.toLowerCase().includes('khách sạn') ||
                    cat.name.toLowerCase().includes('hotel') ||
                    cat.name.toLowerCase() === 'khách sạn'
                );
                if (hotelCategory) {
                    photoCategoryId = hotelCategory.id;
                    console.log(`[hotelService] Found photo category "Khách sạn": ${photoCategoryId}`);
                } else if (categories.length > 0) {
                    // Fallback: dùng category đầu tiên
                    photoCategoryId = categories[0].id;
                    console.warn(`[hotelService] Could not find "Khách sạn" category, using first category: ${categories[0].name}`);
                }
            } catch (error) {
                console.error('[hotelService] Error fetching photo categories:', error);
                console.warn('[hotelService] Will proceed without photoCategoryId - backend may reject with validation error');
            }

            // Append các ảnh theo format backend yêu cầu: photosToAdd[0].files[0], photosToAdd[0].files[1], ...
            // Backend expect 'photosToAdd' (List<PhotoCreationRequest>), không phải 'photos'
            validImages.forEach((image, index) => {
                updateFormData.append(`photosToAdd[0].files[${index}]`, image);
            });

            // Backend yêu cầu categoryId (@NotBlank trong PhotoCreationRequest)
            if (photoCategoryId) {
                updateFormData.append('photosToAdd[0].categoryId', photoCategoryId);
                console.log(`[hotelService] Using photo category ID: ${photoCategoryId}`);
            } else {
                console.error('[hotelService] WARNING: No photoCategoryId - backend will reject with validation error');
            }
        }

        // Xử lý amenities (amenityIdsToAdd)
        const amenityIdsToAdd = formData.getAll('amenityIdsToAdd[]');
        if (amenityIdsToAdd.length > 0) {
            console.log(`[hotelService] Adding ${amenityIdsToAdd.length} amenities`);
            amenityIdsToAdd.forEach((amenityId) => {
                if (amenityId && amenityId.toString().trim() !== '') {
                    updateFormData.append('amenityIdsToAdd[]', amenityId.toString().trim());
                }
            });
        }

        // Xử lý entertainment venues cần UPDATE (đã có trong hotel) với distance mới
        // Parse từ format: entertainmentVenuesWithDistanceToUpdate[0].entertainmentVenueId, entertainmentVenuesWithDistanceToUpdate[0].distance
        const venueUpdateIndices = new Set<number>();
        formData.forEach((value, key) => {
            const match = key.match(/^entertainmentVenuesWithDistanceToUpdate\[(\d+)\]\.(entertainmentVenueId|distance)$/);
            if (match) {
                venueUpdateIndices.add(parseInt(match[1]));
            }
        });
        
        if (venueUpdateIndices.size > 0) {
            console.log(`[hotelService] Updating ${venueUpdateIndices.size} existing entertainment venues with new distance`);
            venueUpdateIndices.forEach((index) => {
                const venueId = formData.get(`entertainmentVenuesWithDistanceToUpdate[${index}].entertainmentVenueId`);
                const distance = formData.get(`entertainmentVenuesWithDistanceToUpdate[${index}].distance`);
                if (venueId && distance) {
                    updateFormData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].entertainmentVenueId`, venueId.toString());
                    updateFormData.append(`entertainmentVenuesWithDistanceToUpdate[${index}].distance`, distance.toString());
                }
            });
        }

        // Xử lý entertainment venues cần ADD (chưa có trong hotel) với distance
        // Parse từ format: entertainmentVenuesWithDistanceToAdd[0].entertainmentVenueId, entertainmentVenuesWithDistanceToAdd[0].distance
        const venueAddIndices = new Set<number>();
        formData.forEach((value, key) => {
            const match = key.match(/^entertainmentVenuesWithDistanceToAdd\[(\d+)\]\.(entertainmentVenueId|distance)$/);
            if (match) {
                venueAddIndices.add(parseInt(match[1]));
            }
        });
        
        if (venueAddIndices.size > 0) {
            console.log(`[hotelService] Adding ${venueAddIndices.size} new entertainment venues with distance`);
            venueAddIndices.forEach((index) => {
                const venueId = formData.get(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`);
                const distance = formData.get(`entertainmentVenuesWithDistanceToAdd[${index}].distance`);
                if (venueId && distance) {
                    updateFormData.append(`entertainmentVenuesWithDistanceToAdd[${index}].entertainmentVenueId`, venueId.toString());
                    updateFormData.append(`entertainmentVenuesWithDistanceToAdd[${index}].distance`, distance.toString());
                }
            });
        }

        // Xử lý entertainment venues mới (entertainmentVenuesToAdd)
        // Parse từ format: entertainmentVenuesToAdd[0].name, entertainmentVenuesToAdd[0].distance, entertainmentVenuesToAdd[0].cityId, entertainmentVenuesToAdd[0].categoryId
        const newVenueIndices = new Set<number>();
        formData.forEach((value, key) => {
            const match = key.match(/^entertainmentVenuesToAdd\[(\d+)\]\.(name|distance|cityId|categoryId)$/);
            if (match) {
                newVenueIndices.add(parseInt(match[1]));
            }
        });
        
        if (newVenueIndices.size > 0) {
            console.log(`[hotelService] Adding ${newVenueIndices.size} new entertainment venues`);
            newVenueIndices.forEach((index) => {
                const name = formData.get(`entertainmentVenuesToAdd[${index}].name`);
                const distance = formData.get(`entertainmentVenuesToAdd[${index}].distance`);
                const cityId = formData.get(`entertainmentVenuesToAdd[${index}].cityId`);
                const categoryId = formData.get(`entertainmentVenuesToAdd[${index}].categoryId`);
                if (name && distance && cityId && categoryId) {
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].name`, name.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].distance`, distance.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].cityId`, cityId.toString());
                    updateFormData.append(`entertainmentVenuesToAdd[${index}].categoryId`, categoryId.toString());
                }
            });
        }

        // KHÔNG set Content-Type header - axios sẽ tự động set với boundary cho FormData
        const response = await serverClient.put<ApiResponse<HotelResponse>>(
            `${baseURL}/${id}`,
            updateFormData
        );

        if (response.data.statusCode === 200 && response.data.data) {
            console.log("[hotelService] Hotel updated successfully (server):", response.data.data.id);
            return mapHotelResponseToHotel(response.data.data);
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[hotelService] Error updating hotel ${id} (server):`, error);
        throw new Error(error.response?.data?.message || 'Không thể cập nhật khách sạn');
    }
};

/**
 * Xóa khách sạn (Client-side - dùng apiClient)
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

/**
 * Xóa khách sạn (Server-side - dùng serverApiClient để lấy token từ cookies)
 */
export const deleteHotelServer = async (id: string): Promise<{ success: boolean }> => {
    try {
        console.log(`[hotelService] [SERVER] Deleting hotel with id: ${id}`);

        const serverClient = await createServerApiClient();
        const response = await serverClient.delete<ApiResponse<HotelResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200) {
            console.log("[hotelService] [SERVER] Hotel deleted successfully");
            return { success: true };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[hotelService] [SERVER] Error deleting hotel ${id}:`, error);
        if (error.response?.status === 401 || error.response?.status === 403) {
            throw new Error('Không có quyền xóa khách sạn. Vui lòng đăng nhập lại.');
        }
        throw new Error(error.response?.data?.message || 'Không thể xóa khách sạn');
    }
};
