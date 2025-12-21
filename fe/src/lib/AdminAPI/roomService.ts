// lib/AdminAPI/roomService.ts
import type { Room } from "@/types";
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";
import { API_BASE_URL } from "@/config/api.config";

const baseURL = '/accommodation/rooms';

// Interface từ API response (theo cấu trúc thực tế từ API)
interface RoomResponse {
    id: string;
    hotelId?: string; // Có thể không có trong response (deprecated, dùng hotel.id)
    hotel?: { id: string; name: string }; // RoomDetailsResponse có hotel object
    name: string;
    view: string;
    area: number;
    photos?: Array<{
        id: string;
        name: string;
        photos: Array<{ id: string; url: string }>;
    }>;
    maxAdults: number;
    maxChildren: number;
    basePricePerNight: number;
    currentPricePerNight?: number;
    availableRooms?: number; // Số phòng khả dụng
    totalRooms?: number; // Tổng số phòng
    bedType?: { id: string; name: string };
    smokingAllowed: boolean;
    wifiAvailable: boolean;
    breakfastIncluded: boolean;
    quantity?: number; // Có thể không có, dùng totalRooms thay thế
    amenities?: Array<{
        id: string;
        name: string;
        amenities: Array<{ id: string; name: string; free?: boolean }>;
    }>;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

interface PaginatedRoomResponse {
    content: RoomResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Helper function để map từ RoomResponse sang Room
function mapRoomResponseToRoom(response: RoomResponse): Room {

    // Xử lý photos - cấu trúc nested: photos[].photos[].url
    let imageUrl: string = '';
    let images: string[] = [];

    if (response.photos && Array.isArray(response.photos) && response.photos.length > 0) {

        // Xử lý từng photo category (Phòng, Phòng tắm, etc.)
        response.photos.forEach((photoCategory, categoryIndex) => {
            // Kiểm tra nếu có nested photos array
            if (photoCategory && photoCategory.photos && Array.isArray(photoCategory.photos)) {
                photoCategory.photos.forEach((photo) => {
                    if (photo && photo.url && typeof photo.url === 'string') {
                        images.push(photo.url);
                    }
                });
            }
        });

        // Lấy ảnh đầu tiên làm imageUrl chính
        imageUrl = images[0] || '';
    } else {
    }

    // Xử lý amenities - cấu trúc nested: amenities[].amenities[]
    const flatAmenities: Array<{ id: string; name: string }> = [];
    if (response.amenities && Array.isArray(response.amenities) && response.amenities.length > 0) {
        response.amenities.forEach((amenityCategory) => {
            if (amenityCategory && amenityCategory.amenities && Array.isArray(amenityCategory.amenities)) {
                amenityCategory.amenities.forEach((amenity) => {
                    if (amenity && amenity.id && amenity.name) {
                        flatAmenities.push({
                            id: amenity.id,
                            name: amenity.name
                        });
                    }
                });
            }
        });
    }

    // Xử lý quantity - Backend trả về totalRooms (từ room.getQuantity())
    // RoomResponse (list) chỉ có totalRooms, không có quantity field
    // Nếu có quantity (từ RoomDetailsResponse), dùng nó, nếu không dùng totalRooms
    const quantity = response.quantity !== undefined && response.quantity !== null
        ? response.quantity
        : (response.totalRooms !== undefined && response.totalRooms !== null
            ? response.totalRooms
            : 0);

    // Map status từ backend (lowercase: active, inactive, maintenance, closed) sang frontend (uppercase)
    // Theo API docs: active, inactive, maintenance, closed
    const statusMap: Record<string, Room['status']> = {
        'active': 'AVAILABLE',      // Hoạt động - available for bookings
        'inactive': 'INACTIVE',      // Ngưng hoạt động - not available for new bookings
        'maintenance': 'MAINTENANCE', // Bảo trì - under maintenance
        'closed': 'CLOSED',          // Đóng cửa - closed
        // Fallback cho uppercase values
        'AVAILABLE': 'AVAILABLE',
        'INACTIVE': 'INACTIVE',
        'MAINTENANCE': 'MAINTENANCE',
        'CLOSED': 'CLOSED',
        // OCCUPIED - legacy support (không còn trong API docs, nhưng giữ để backward compatibility)
        'occupied': 'OCCUPIED',
        'OCCUPIED': 'OCCUPIED'
    };
    const rawStatus = response.status || 'active';
    const mappedStatus = statusMap[rawStatus] || 'AVAILABLE';

    return {
        id: response.id,
        hotelId: response.hotelId || '', // Có thể không có trong response
        name: response.name,
        type: response.view || '',
        price: response.basePricePerNight, // Backward compatibility
        basePricePerNight: response.basePricePerNight,
        currentPricePerNight: response.currentPricePerNight,
        status: mappedStatus,
        image: imageUrl,
        images: images,
        quantity: quantity, // Tổng số phòng
        availableQuantity: response.availableRooms, // Số phòng khả dụng (để hiển thị tồn)
        amenities: flatAmenities, // Tiện ích phòng (đã flatten)
    };
}

/**
 * Lấy danh sách phòng theo hotelId với phân trang
 */
export interface GetRoomsParams {
    hotelId: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
}

export interface PaginatedRoomsResult {
    rooms: Room[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

export const getRoomsByHotelId = async (
    hotelId: string,
    page: number = 0,
    size: number = 10
): Promise<PaginatedRoomsResult> => {
    try {

        // Backend sử dụng kebab-case: "hotel-id", "sort-by", "sort-dir"
        const params: any = {
            'hotel-id': hotelId.trim(), // Backend dùng "hotel-id" (kebab-case)
            page,
            size,
            'sort-by': 'createdAt', // Optional
            'sort-dir': 'ASC'        // Default ASC
        };


        // Thêm timestamp để bypass cache (nếu có)
        const response = await apiClient.get<ApiResponse<PaginatedRoomResponse>>(
            baseURL,
            {
                params: {
                    ...params,
                    _t: Date.now() // Cache buster
                }
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            const rooms = response.data.data.content.map(mapRoomResponseToRoom);
            console.log("[roomService] Mapped rooms quantity:", rooms.map(r => ({
                id: r.id,
                name: r.name,
                quantity: r.quantity,
                availableQuantity: r.availableQuantity
            })));
            return {
                rooms,
                page: response.data.data.page,
                size: response.data.data.size,
                totalItems: response.data.data.totalItems,
                totalPages: response.data.data.totalPages,
                first: response.data.data.first,
                last: response.data.data.last,
                hasNext: response.data.data.hasNext,
                hasPrevious: response.data.data.hasPrevious,
            };
        }

        return {
            rooms: [],
            page: 0,
            size: 10,
            totalItems: 0,
            totalPages: 0,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách phòng');
    }
};

/**
 * Lấy thông tin một phòng theo ID
 */
export const getRoomById = async (roomId: string): Promise<RoomResponse | null> => {
    try {

        const response = await apiClient.get<ApiResponse<RoomResponse>>(
            `${baseURL}/${roomId}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return null;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin phòng');
    }
};

/**
 * Tạo phòng mới - Client version (dùng apiClient với token từ localStorage)
 */
export interface CreateRoomPayload {
    hotelId: string;
    name: string;
    view: string;
    area: number;
    photos: File[]; // Files sẽ được thêm vào FormData
    maxAdults: number;
    maxChildren: number;
    basePricePerNight: number;
    bedTypeId: string; // BedType ID (UUID) - được tìm từ bedTypeName
    smokingAllowed?: boolean;
    wifiAvailable?: boolean;
    breakfastIncluded?: boolean;
    quantity: number;
    status?: string; // Status cho room (active, inactive, maintenance, closed)
    amenityIds: string[];
}

export const createRoom = async (payload: CreateRoomPayload): Promise<RoomResponse> => {
    try {
        console.log("[roomService] Creating new room with payload:", {
            ...payload,
            photos: `[${payload.photos.length} files]`,
        });

        const formData = new FormData();
        formData.append('hotelId', payload.hotelId);
        formData.append('name', payload.name);
        formData.append('view', payload.view);
        formData.append('area', payload.area.toString());
        formData.append('maxAdults', payload.maxAdults.toString());
        formData.append('maxChildren', payload.maxChildren.toString());
        formData.append('basePricePerNight', payload.basePricePerNight.toString());
        formData.append('bedTypeId', payload.bedTypeId);
        formData.append('quantity', payload.quantity.toString());

        // Thêm các boolean fields (nếu có)
        if (payload.smokingAllowed !== undefined) {
            formData.append('smokingAllowed', payload.smokingAllowed.toString());
        }
        if (payload.wifiAvailable !== undefined) {
            formData.append('wifiAvailable', payload.wifiAvailable.toString());
        }
        if (payload.breakfastIncluded !== undefined) {
            formData.append('breakfastIncluded', payload.breakfastIncluded.toString());
        }

        // Thêm photos
        payload.photos.forEach((photo) => {
            formData.append('photos', photo);
        });

        // Thêm amenityIds (array)
        payload.amenityIds.forEach((amenityId) => {
            formData.append('amenityIds', amenityId);
        });

        const response = await apiClient.post<ApiResponse<RoomResponse>>(
            baseURL,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.response?.data?.error
            || error.message
            || 'Không thể tạo phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Create room - Server version (dùng serverApiClient với token từ cookies)
 * Dùng trong server actions
 */
export const createRoomServer = async (payload: CreateRoomPayload): Promise<RoomResponse> => {
    try {
        console.log("[roomService] Creating new room (server) with payload:", {
            ...payload,
            photos: `[${payload.photos.length} files]`,
        });

        const serverClient = await createServerApiClient();

        // Verify token exists before making request
        // Token check đã được thực hiện trong createServerApiClient

        const formData = new FormData();
        formData.append('hotelId', payload.hotelId);
        formData.append('name', payload.name);
        formData.append('view', payload.view);
        formData.append('area', payload.area.toString());
        formData.append('maxAdults', payload.maxAdults.toString());
        formData.append('maxChildren', payload.maxChildren.toString());
        formData.append('basePricePerNight', payload.basePricePerNight.toString());
        formData.append('bedTypeId', payload.bedTypeId);
        formData.append('quantity', payload.quantity.toString());

        if (payload.status) {
            formData.append('status', payload.status);
        }

        // Boolean fields - gửi dưới dạng string "true"/"false" hoặc boolean
        // Backend có thể expect cả hai, nên thử gửi boolean trước
        formData.append('smokingAllowed', String(payload.smokingAllowed ?? false));
        formData.append('wifiAvailable', String(payload.wifiAvailable ?? false));
        formData.append('breakfastIncluded', String(payload.breakfastIncluded ?? false));

        // Backend yêu cầu categoryId trong PhotoCreationRequest (@NotBlank)
        // Fetch photo categories để tìm category "Phòng"
        let photoCategoryId: string | null = null;
        try {
            const { getPhotoCategoriesServer } = await import('./photoCategoryService');
            const categories = await getPhotoCategoriesServer();
            const roomCategory = categories.find(cat =>
                cat.name.toLowerCase().includes('phòng') ||
                cat.name.toLowerCase().includes('room') ||
                cat.name.toLowerCase() === 'phòng'
            );
            if (roomCategory) {
                photoCategoryId = roomCategory.id;
            } else if (categories.length > 0) {
                // Fallback: dùng category đầu tiên
                photoCategoryId = categories[0].id;
            }
        } catch (error) {
            // Nếu fetch fail, có thể backend sẽ reject - nhưng thử tiếp để xem error cụ thể
        }

        if (!photoCategoryId) {
        }

        // Append photos theo format backend mong đợi: photos[0].files[0], photos[0].files[1], ...
        // Theo Postman test: photos được gửi với format photos[0].files[0], photos[0].files[1]
        // Trong Postman KHÔNG có photos[0].categoryId - có thể backend không yêu cầu hoặc có default
        // Nhưng theo code backend, PhotoCreationRequest cần categoryId, nên thêm vào nếu có

        // Spring Boot @ModelAttribute với nested List có thể expect format khác
        // Thử format: photos[0].files (không có index trong files array)
        // Hoặc photos[0].files[0], photos[0].files[1] (theo Postman)
        // Theo Postman: photos[0].files[0], photos[0].files[1] - đúng format
        payload.photos.forEach((photo, index) => {
            formData.append(`photos[0].files[${index}]`, photo);
        });

        // Backend yêu cầu categoryId (@NotBlank trong PhotoCreationRequest)
        // Thêm categoryId vào FormData
        if (photoCategoryId) {
            formData.append('photos[0].categoryId', photoCategoryId);
        } else {
        }

        // Append amenityIds (array of strings)
        payload.amenityIds.forEach((amenityId) => {
            formData.append('amenityIds', amenityId);
        });

        // Log FormData entries để debug - CHI TIẾT HƠN
        const formDataEntries: Record<string, string> = {};
        const formDataArray: Array<{ key: string; value: string; type: string }> = [];

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                formDataEntries[key] = `[File: ${value.name}, ${value.size} bytes, type: ${value.type}]`;
                formDataArray.push({
                    key,
                    value: `File: ${value.name} (${value.size} bytes)`,
                    type: 'File'
                });
            } else {
                formDataEntries[key] = String(value);
                formDataArray.push({
                    key,
                    value: String(value),
                    type: 'String'
                });
            }
        }

        // Đảm bảo URL đúng và method POST
        const url = baseURL; // '/accommodation/rooms'

        console.log("=".repeat(80));
        console.log("[roomService] ===== REQUEST BODY (FormData) DETAILS =====");
        console.log("[roomService] Total fields:", Object.keys(formDataEntries).length);
        console.log("[roomService] FormData entries (as array):");
        formDataArray.forEach((entry, index) => {
            console.log(`  [${index + 1}] ${entry.key} = ${entry.value} (${entry.type})`);
        });
        console.log("[roomService] FormData entries (as object):", formDataEntries);
        console.log("[roomService] Content-Type: multipart/form-data (auto-set by Axios)");
        console.log("=".repeat(80));

        // Sử dụng axios.post() thay vì request() để đảm bảo method POST
        // Axios sẽ tự động xử lý FormData và set Content-Type với boundary
        const fullUrl = `${API_BASE_URL}${url}`;
        console.log("[roomService] About to call serverClient.post() with:");
        console.log("  - Method: POST (explicit)");
        console.log("  - FormData entries count:", Array.from(formData.entries()).length);

        const response = await serverClient.post<ApiResponse<RoomResponse>>(
            url,
            formData,
            {
                // Không set Content-Type - axios sẽ tự động set với boundary cho FormData
                // Explicitly set method để đảm bảo
                method: 'POST',
                headers: {
                    // Axios sẽ tự động set Content-Type: multipart/form-data; boundary=...
                }
            }
        );


        console.log("[roomService] Response headers:", JSON.stringify(response.headers, null, 2));

        // Kiểm tra xem response có phải là HTML (redirect/error page) không
        const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
        const responseDataString = typeof response.data === 'string' ? response.data : '';
        const isHtmlResponse = typeof response.data === 'string' && (
            contentType.includes('text/html') ||
            responseDataString.trim().toLowerCase().startsWith('<!doctype') ||
            responseDataString.trim().toLowerCase().startsWith('<html')
        );

        if (isHtmlResponse) {
            console.error("[roomService] Response preview (first 500 chars):", responseDataString.substring(0, 500));
            throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }

        // Log response data (chỉ nếu là JSON)
        if (typeof response.data === 'object' && response.data !== null) {
            console.log("[roomService] Response data keys:", Object.keys(response.data));
            try {
                console.log("[roomService] Full response.data:", JSON.stringify(response.data, null, 2));
            } catch (e) {
            }
        }

        // Kiểm tra response structure - Backend có thể trả về format khác
        // QUAN TRỌNG: Backend có thể trả về HTTP 200 nhưng statusCode trong body != 200 (lỗi business logic)
        const responseData = response.data as any;

        // Kiểm tra statusCode trong response body (backend dùng ApiResponse với statusCode)
        if (responseData?.statusCode && responseData.statusCode !== 200 && responseData.statusCode !== 201) {
            throw new Error(responseData.message || 'Lỗi từ server');
        }

        if (response.status === 200 || response.status === 201) {
            // Kiểm tra các format response khả dĩ
            let roomData: RoomResponse | null = null;

            console.log("[roomService] Response data keys:", responseData ? Object.keys(responseData) : 'null');
            console.log("[roomService] Full response data:", JSON.stringify(responseData, null, 2));

            // Format 1: { statusCode: 200, message: "", data: {...} }
            if (responseData?.statusCode === 200 && responseData?.data) {
                roomData = responseData.data as RoomResponse;
            }
            // Format 2: { statusCode: 200, message: "", data: null } nhưng data thực tế ở root
            else if (responseData?.statusCode === 200 && (responseData?.data === null || responseData?.data === undefined)) {
                if (responseData?.id) {
                    roomData = responseData as RoomResponse;
                } else {
                }
            }
            // Format 3: Data ở root level (không có wrapper)
            else if (responseData?.id && !responseData?.statusCode) {
                console.log("[roomService] Format 3: Data at root level (no wrapper)");
                roomData = responseData as RoomResponse;
            }
            // Format 4: HTTP 200/201 nhưng structure khác
            else if (responseData && typeof responseData === 'object') {
                // Thử lấy data từ bất kỳ đâu trong response
                roomData = responseData.data || responseData;
                // Kiểm tra xem có phải RoomResponse không
                if (roomData && typeof roomData === 'object' && !roomData.id) {
                    roomData = null;
                }
            }

            if (roomData && roomData.id) {
                console.log(`[roomService] ✅ Room created successfully (server): ${roomData.id}`);
                return roomData as RoomResponse;
            } else {
                console.error("[roomService] ❌ Response has status 200 but no valid room data:", {
                    statusCode: responseData?.statusCode,
                    hasData: !!responseData?.data,
                    dataType: typeof responseData?.data,
                    dataValue: responseData?.data,
                    dataIsNull: responseData?.data === null,
                    dataIsUndefined: responseData?.data === undefined,
                    hasIdAtRoot: !!responseData?.id,
                    responseKeys: responseData ? Object.keys(responseData) : [],
                    responseData: responseData,
                });

                // Thử lấy message từ response
                const errorMessage = responseData?.message
                    || (responseData?.data === null ? 'Backend trả về data: null - có thể có lỗi trong quá trình tạo phòng' : 'Server returned success but no valid room data');
                throw new Error(errorMessage);
            }
        }

        // Nếu statusCode không phải 200/201
        const errorMsg = response.data?.message || `Invalid response from server (status: ${response.status})`;
        console.error("[roomService] Invalid response:", {
            status: response.status,
            statusCode: response.data?.statusCode,
            message: errorMsg,
            fullResponse: response.data,
        });
        throw new Error(errorMsg);
    } catch (error: any) {
        console.error("=".repeat(80));
        console.error("[roomService] Error response data:", JSON.stringify(error.response?.data, null, 2));
        console.error("[roomService] Error response headers:", JSON.stringify(error.response?.headers, null, 2));
        console.error("[roomService] Request config:", {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url,
            headers: error.config?.headers,
        });

        // Log chi tiết hơn về 405 error
        if (error.response?.status === 405) {
            console.error("  4. No path conflicts (e.g., GET /accommodation/rooms vs POST /accommodation/rooms)");
            console.error("=".repeat(80));
        }

        // Log FormData nếu có trong error config
        if (error.config?.data instanceof FormData) {
            const errorFormDataEntries: Array<{ key: string; value: string }> = [];
            for (const [key, value] of error.config.data.entries()) {
                if (value instanceof File) {
                    errorFormDataEntries.push({
                        key,
                        value: `File: ${value.name} (${value.size} bytes)`
                    });
                } else {
                    errorFormDataEntries.push({
                        key,
                        value: String(value)
                    });
                }
            }
            errorFormDataEntries.forEach((entry, index) => {
            });
        }
        console.error("=".repeat(80));

        // Trích xuất thông điệp lỗi chi tiết hơn
        let errorMessage = 'Không thể tạo phòng';

        // Kiểm tra status code cụ thể
        if (error.response?.status === 405) {
            errorMessage = 'Method Not Allowed - Backend có thể không chấp nhận request này. Vui lòng kiểm tra backend configuration.';
            console.error('[roomService] Backend @PostMapping có thể sai cú pháp (thiếu consumes = MediaType.MULTIPART_FORM_DATA_VALUE)');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
            errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (error.response?.data) {
            // Kiểm tra xem response có phải HTML không (redirect/error page)
            const contentType = error.response.headers?.['content-type'] || error.response.headers?.['Content-Type'] || '';
            const responseData = error.response.data;
            const isHtml = typeof responseData === 'string' && (
                contentType.includes('text/html') ||
                responseData.trim().toLowerCase().startsWith('<!doctype') ||
                responseData.trim().toLowerCase().startsWith('<html')
            );

            if (isHtml) {
                errorMessage = 'Backend trả về HTML thay vì JSON - có thể là redirect/error page. Vui lòng kiểm tra authentication.';
                console.error('[roomService] ⚠️ Received HTML response:', responseData.substring(0, 500));
            } else if (typeof responseData === 'object') {
                errorMessage = responseData.message
                    || responseData.error
                    || error.response.statusText
                    || 'Lỗi từ server';
            } else {
                errorMessage = String(responseData) || error.response.statusText || 'Lỗi không xác định';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Cập nhật phòng - Client version (dùng apiClient với token từ localStorage)
 */
export const updateRoom = async (
    roomId: string,
    payload: Partial<CreateRoomPayload>
): Promise<RoomResponse> => {
    try {

        const formData = new FormData();

        if (payload.hotelId) formData.append('hotelId', payload.hotelId);
        if (payload.name) formData.append('name', payload.name);
        if (payload.view) formData.append('view', payload.view);
        if (payload.area !== undefined) formData.append('area', payload.area.toString());
        if (payload.maxAdults !== undefined) formData.append('maxAdults', payload.maxAdults.toString());
        if (payload.maxChildren !== undefined) formData.append('maxChildren', payload.maxChildren.toString());
        if (payload.basePricePerNight !== undefined) {
            formData.append('basePricePerNight', payload.basePricePerNight.toString());
        }
        if (payload.bedTypeId) formData.append('bedTypeId', payload.bedTypeId);
        if (payload.quantity !== undefined) formData.append('quantity', payload.quantity.toString());

        if (payload.status) formData.append('status', payload.status);

        if (payload.smokingAllowed !== undefined) {
            formData.append('smokingAllowed', payload.smokingAllowed.toString());
        }
        if (payload.wifiAvailable !== undefined) {
            formData.append('wifiAvailable', payload.wifiAvailable.toString());
        }
        if (payload.breakfastIncluded !== undefined) {
            formData.append('breakfastIncluded', payload.breakfastIncluded.toString());
        }

        if (payload.photos && payload.photos.length > 0) {
            payload.photos.forEach((photo) => {
                formData.append('photos', photo);
            });
        }

        if (payload.amenityIds && payload.amenityIds.length > 0) {
            payload.amenityIds.forEach((amenityId) => {
                formData.append('amenityIds', amenityId);
            });
        }

        const response = await apiClient.put<ApiResponse<RoomResponse>>(
            `${baseURL}/${roomId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Update room - Server version (dùng serverApiClient với token từ cookies)
 * Dùng trong server actions
 */
export const updateRoomServer = async (
    roomId: string,
    payload: Partial<CreateRoomPayload>
): Promise<RoomResponse> => {
    try {
        console.log(`[roomService] Updating room ${roomId} (server)`, {
            ...payload,
            photos: payload.photos ? `[${payload.photos.length} files]` : undefined,
        });

        const serverClient = await createServerApiClient();

        const formData = new FormData();

        if (payload.hotelId) formData.append('hotelId', payload.hotelId);
        if (payload.name) formData.append('name', payload.name);
        if (payload.view) formData.append('view', payload.view);
        if (payload.area !== undefined) formData.append('area', payload.area.toString());
        if (payload.maxAdults !== undefined) formData.append('maxAdults', payload.maxAdults.toString());
        if (payload.maxChildren !== undefined) formData.append('maxChildren', payload.maxChildren.toString());
        if (payload.basePricePerNight !== undefined) {
            formData.append('basePricePerNight', payload.basePricePerNight.toString());
        }
        if (payload.bedTypeId) formData.append('bedTypeId', payload.bedTypeId);
        if (payload.quantity !== undefined) formData.append('quantity', payload.quantity.toString());

        if (payload.status) formData.append('status', payload.status);

        if (payload.smokingAllowed !== undefined) {
            formData.append('smokingAllowed', String(payload.smokingAllowed));
        }
        if (payload.wifiAvailable !== undefined) {
            formData.append('wifiAvailable', String(payload.wifiAvailable));
        }
        if (payload.breakfastIncluded !== undefined) {
            formData.append('breakfastIncluded', String(payload.breakfastIncluded));
        }

        // Handle photos - tương tự createRoomServer
        if (payload.photos && payload.photos.length > 0) {
            // Fetch photo category ID
            let photoCategoryId: string | null = null;
            try {
                const { getPhotoCategoriesServer } = await import('./photoCategoryService');
                const categories = await getPhotoCategoriesServer();
                const roomCategory = categories.find(cat =>
                    cat.name.toLowerCase().includes('phòng') ||
                    cat.name.toLowerCase().includes('room') ||
                    cat.name.toLowerCase() === 'phòng'
                );
                if (roomCategory) {
                    photoCategoryId = roomCategory.id;
                } else if (categories.length > 0) {
                    photoCategoryId = categories[0].id;
                }
            } catch (error) {
            }

            // Append photos theo format backend mong đợi
            payload.photos.forEach((photo, index) => {
                formData.append(`photos[0].files[${index}]`, photo);
            });

            if (photoCategoryId) {
                formData.append('photos[0].categoryId', photoCategoryId);
            }
        }

        // Append amenityIds
        if (payload.amenityIds && payload.amenityIds.length > 0) {
            payload.amenityIds.forEach((amenityId) => {
                formData.append('amenityIds', amenityId);
            });
        }

        const url = `${baseURL}/${roomId}`;

        const response = await serverClient.put<ApiResponse<RoomResponse>>(
            url,
            formData,
            {
                method: 'PUT',
                headers: {
                    // Axios sẽ tự động set Content-Type với boundary cho FormData
                }
            }
        );

        if (response.status === 200 || response.status === 201) {
            const responseData = response.data as any;

            if (responseData?.statusCode && responseData.statusCode !== 200 && responseData.statusCode !== 201) {
                throw new Error(responseData.message || 'Lỗi từ server');
            }

            if (responseData?.statusCode === 200 && responseData?.data) {
                const updatedRoom = responseData.data as RoomResponse;
                console.log(`[roomService] ✅ Room updated successfully (server): ${updatedRoom.id}`);
                console.log(`[roomService] Updated room quantity:`, {
                    quantity: updatedRoom.quantity,
                    totalRooms: updatedRoom.totalRooms,
                    availableRooms: updatedRoom.availableRooms
                });
                return updatedRoom;
            }

            // Fallback: check if data is at root level
            if (responseData?.id) {
                return responseData as RoomResponse;
            }

            throw new Error('Invalid response from server');
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        console.error(`[roomService] Error updating room ${roomId} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Xóa phòng - Client version (dùng apiClient với token từ localStorage)
 */
export const deleteRoom = async (roomId: string): Promise<void> => {
    try {

        const response = await apiClient.delete<ApiResponse<RoomResponse>>(
            `${baseURL}/${roomId}`
        );

        if (response.data.statusCode === 200) {
            return;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Delete room - Server version (dùng serverApiClient với token từ cookies)
 * Dùng trong server actions
 */
export const deleteRoomServer = async (roomId: string): Promise<void> => {
    try {
        console.log(`[roomService] Deleting room ${roomId} (server)`);

        const serverClient = await createServerApiClient();

        const url = `${baseURL}/${roomId}`;

        const response = await serverClient.delete<ApiResponse<RoomResponse>>(url);

        if (response.status === 200 || response.status === 204) {
            const responseData = response.data as any;

            if (responseData?.statusCode && responseData.statusCode !== 200 && responseData.statusCode !== 204) {
                throw new Error(responseData.message || 'Lỗi từ server');
            }

            console.log(`[roomService] ✅ Room deleted successfully (server): ${roomId}`);
            return;
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        console.error(`[roomService] Error deleting room ${roomId} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa phòng';
        throw new Error(errorMessage);
    }
};
