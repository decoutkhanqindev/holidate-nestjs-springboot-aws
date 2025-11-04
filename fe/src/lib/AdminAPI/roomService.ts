// lib/AdminAPI/roomService.ts
import type { Room } from "@/types";
import apiClient, { ApiResponse } from "@/service/apiClient";
import { createServerApiClient } from "./serverApiClient";

const baseURL = '/accommodation/rooms';

// Interface từ API response (theo cấu trúc thực tế từ API)
interface RoomResponse {
    id: string;
    hotelId?: string; // Có thể không có trong response
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
    console.log("[mapRoomResponseToRoom] Mapping room:", response.id, response.name);

    // Xử lý photos - cấu trúc nested: photos[].photos[].url
    let imageUrl: string = '';
    let images: string[] = [];

    if (response.photos && Array.isArray(response.photos) && response.photos.length > 0) {
        console.log("[mapRoomResponseToRoom] Processing photos array, length:", response.photos.length);

        // Xử lý từng photo category (Phòng, Phòng tắm, etc.)
        response.photos.forEach((photoCategory, categoryIndex) => {
            // Kiểm tra nếu có nested photos array
            if (photoCategory && photoCategory.photos && Array.isArray(photoCategory.photos)) {
                photoCategory.photos.forEach((photo) => {
                    if (photo && photo.url && typeof photo.url === 'string') {
                        images.push(photo.url);
                        console.log(`[mapRoomResponseToRoom] Added photo URL from category "${photoCategory.name}": ${photo.url}`);
                    }
                });
            }
        });

        // Lấy ảnh đầu tiên làm imageUrl chính
        imageUrl = images[0] || '';
        console.log("[mapRoomResponseToRoom] Final imageUrl:", imageUrl);
        console.log("[mapRoomResponseToRoom] Total images found:", images.length);
    } else {
        console.log("[mapRoomResponseToRoom] No photos found or empty photos array");
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
    console.log("[mapRoomResponseToRoom] Flat amenities count:", flatAmenities.length);

    // Xử lý quantity - dùng totalRooms nếu có, nếu không thì dùng quantity
    const quantity = response.totalRooms || response.quantity || 0;
    console.log("[mapRoomResponseToRoom] Quantity (totalRooms):", quantity);
    console.log("[mapRoomResponseToRoom] AvailableRooms:", response.availableRooms);

    return {
        id: response.id,
        hotelId: response.hotelId || '', // Có thể không có trong response
        name: response.name,
        type: response.view || '',
        price: response.basePricePerNight,
        status: (response.status || 'AVAILABLE').toUpperCase() as Room['status'],
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
        console.log(`[roomService] Fetching rooms for hotelId: ${hotelId}, page: ${page}, size: ${size}`);

        // Backend sử dụng kebab-case: "hotel-id", "sort-by", "sort-dir"
        const params: any = {
            'hotel-id': hotelId.trim(), // Backend dùng "hotel-id" (kebab-case)
            page,
            size,
            'sort-by': 'createdAt', // Optional
            'sort-dir': 'ASC'        // Default ASC
        };

        console.log("[roomService] Request params:", JSON.stringify(params, null, 2));

        const response = await apiClient.get<ApiResponse<PaginatedRoomResponse>>(
            baseURL,
            {
                params
            }
        );

        if (response.data.statusCode === 200 && response.data.data) {
            console.log("[roomService] Raw API response:", JSON.stringify(response.data.data.content[0], null, 2));
            const rooms = response.data.data.content.map(mapRoomResponseToRoom);
            console.log("[roomService] Mapped rooms count:", rooms.length);
            console.log("[roomService] Sample mapped room:", rooms[0] ? {
                id: rooms[0].id,
                name: rooms[0].name,
                image: rooms[0].image,
                imagesCount: rooms[0].images?.length || 0
            } : 'No rooms');
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
        console.error(`[roomService] Error fetching rooms for hotel ${hotelId}:`, error);
        throw new Error(error.response?.data?.message || 'Không thể tải danh sách phòng');
    }
};

/**
 * Lấy thông tin một phòng theo ID
 */
export const getRoomById = async (roomId: string): Promise<RoomResponse | null> => {
    try {
        console.log(`[roomService] Fetching room with id: ${roomId}`);

        const response = await apiClient.get<ApiResponse<RoomResponse>>(
            `${baseURL}/${roomId}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return response.data.data;
        }

        return null;
    } catch (error: any) {
        console.error(`[roomService] Error fetching room ${roomId}:`, error);
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
            console.log(`[roomService] Room created successfully: ${response.data.data.id}`);
            return response.data.data;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error("[roomService] Error creating room:", error);
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
        console.log("[roomService] Server client created, proceeding with room creation");

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
                console.log(`[roomService] Found photo category "Phòng": ${photoCategoryId}`);
            } else if (categories.length > 0) {
                // Fallback: dùng category đầu tiên
                photoCategoryId = categories[0].id;
                console.warn(`[roomService] Could not find "Phòng" category, using first category: ${categories[0].name}`);
            }
        } catch (error) {
            console.error('[roomService] Error fetching photo categories:', error);
            // Nếu fetch fail, có thể backend sẽ reject - nhưng thử tiếp để xem error cụ thể
            console.warn('[roomService] Will proceed without photoCategoryId - backend may reject with validation error');
        }

        if (!photoCategoryId) {
            console.error('[roomService] No photoCategoryId found - backend will likely reject with CATEGORY_ID_NOT_BLANK error');
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
            console.error('[roomService] WARNING: No photoCategoryId - backend will reject with validation error');
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
        console.log("[roomService] Request URL:", `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}${url}`);
        console.log("[roomService] Request method: POST");
        console.log("[roomService] Content-Type: multipart/form-data (auto-set by Axios)");
        console.log("[roomService] Photos count:", payload.photos.length);
        console.log("[roomService] Photo category ID:", photoCategoryId);
        console.log("=".repeat(80));

        // Sử dụng axios.post() thay vì request() để đảm bảo method POST
        // Axios sẽ tự động xử lý FormData và set Content-Type với boundary
        console.log("[roomService] ===== SENDING REQUEST NOW =====");
        console.log("[roomService] About to call serverClient.post() with:");
        console.log("  - URL:", url);
        console.log("  - FormData:", formData instanceof FormData ? "FormData instance" : typeof formData);
        console.log("  - FormData entries count:", Array.from(formData.entries()).length);

        const response = await serverClient.post<ApiResponse<RoomResponse>>(
            url,
            formData,
            {
                // Không set Content-Type - axios sẽ tự động set với boundary cho FormData
                headers: {
                    // Axios sẽ tự động set Content-Type: multipart/form-data; boundary=...
                }
            }
        );

        console.log("[roomService] ===== RESPONSE RECEIVED =====");
        console.log("[roomService] Status:", response.status);
        console.log("[roomService] Status text:", response.statusText);

        console.log("[roomService] Response status:", response.status);
        console.log("[roomService] Response headers:", JSON.stringify(response.headers, null, 2));
        console.log("[roomService] Response data type:", typeof response.data);
        console.log("[roomService] Content-Type:", response.headers['content-type'] || response.headers['Content-Type']);

        // Kiểm tra xem response có phải là HTML (redirect/error page) không
        const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
        const responseDataString = typeof response.data === 'string' ? response.data : '';
        const isHtmlResponse = typeof response.data === 'string' && (
            contentType.includes('text/html') ||
            responseDataString.trim().toLowerCase().startsWith('<!doctype') ||
            responseDataString.trim().toLowerCase().startsWith('<html')
        );

        if (isHtmlResponse) {
            console.error("[roomService] Received HTML response instead of JSON - likely authentication/redirect issue");
            console.error("[roomService] Response preview (first 500 chars):", responseDataString.substring(0, 500));
            throw new Error('Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
        }

        // Log response data (chỉ nếu là JSON)
        if (typeof response.data === 'object' && response.data !== null) {
            console.log("[roomService] Response data keys:", Object.keys(response.data));
            try {
                console.log("[roomService] Full response.data:", JSON.stringify(response.data, null, 2));
            } catch (e) {
                console.log("[roomService] Cannot stringify response.data");
            }
        }

        // Kiểm tra response structure - Backend có thể trả về format khác
        if (response.status === 200 || response.status === 201) {
            // Kiểm tra các format response khả dĩ
            let roomData: RoomResponse | null = null;
            const responseData = response.data as any; // Dùng any để check structure linh hoạt

            // Format 1: { statusCode: 200, message: "", data: {...} }
            if (responseData?.statusCode === 200 && responseData?.data) {
                roomData = responseData.data as RoomResponse;
            }
            // Format 2: { statusCode: 200, message: "", data: null } nhưng data thực tế ở root
            else if (responseData?.statusCode === 200 && (responseData?.data === null || responseData?.data === undefined) && responseData?.id) {
                roomData = responseData as RoomResponse;
            }
            // Format 3: Data ở root level (không có wrapper)
            else if (responseData?.id && !responseData?.statusCode) {
                roomData = responseData as RoomResponse;
            }
            // Format 4: HTTP 200/201 nhưng structure khác
            else if (responseData && typeof responseData === 'object') {
                console.log("[roomService] Unexpected response structure, attempting to parse:", responseData);
                // Thử lấy data từ bất kỳ đâu trong response
                roomData = responseData.data || responseData;
                // Kiểm tra xem có phải RoomResponse không
                if (roomData && typeof roomData === 'object' && !roomData.id) {
                    roomData = null;
                }
            }

            if (roomData && roomData.id) {
                console.log(`[roomService] Room created successfully (server): ${roomData.id}`);
                return roomData as RoomResponse;
            } else {
                console.error("[roomService] Response has status 200 but no valid room data:", {
                    statusCode: responseData?.statusCode,
                    hasData: !!responseData?.data,
                    dataType: typeof responseData?.data,
                    dataValue: responseData?.data,
                    responseKeys: responseData ? Object.keys(responseData) : [],
                    responseData: responseData,
                });
                throw new Error(responseData?.message || 'Server returned success but no valid room data');
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
        console.error("[roomService] ===== ERROR CREATING ROOM =====");
        console.error("[roomService] Error message:", error.message);
        console.error("[roomService] Error stack:", error.stack);
        console.error("[roomService] Error response status:", error.response?.status);
        console.error("[roomService] Error response statusText:", error.response?.statusText);
        console.error("[roomService] Error response data:", JSON.stringify(error.response?.data, null, 2));
        console.error("[roomService] Error response headers:", JSON.stringify(error.response?.headers, null, 2));
        console.error("[roomService] Request config:", {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            headers: error.config?.headers,
        });

        // Log FormData nếu có trong error config
        if (error.config?.data instanceof FormData) {
            console.error("[roomService] Error request FormData entries:");
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
                console.error(`  [${index + 1}] ${entry.key} = ${entry.value}`);
            });
        }
        console.error("=".repeat(80));

        // Trích xuất thông điệp lỗi chi tiết hơn
        let errorMessage = 'Không thể tạo phòng';

        if (error.response?.data) {
            errorMessage = error.response.data.message
                || error.response.data.error
                || JSON.stringify(error.response.data);
        } else if (error.message) {
            errorMessage = error.message;
        }

        throw new Error(errorMessage);
    }
};

/**
 * Cập nhật phòng
 */
export const updateRoom = async (
    roomId: string,
    payload: Partial<CreateRoomPayload>
): Promise<RoomResponse> => {
    try {
        console.log(`[roomService] Updating room ${roomId}`, payload);

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
        console.error(`[roomService] Error updating room ${roomId}:`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể cập nhật phòng';
        throw new Error(errorMessage);
    }
};

/**
 * Xóa phòng
 */
export const deleteRoom = async (roomId: string): Promise<void> => {
    try {
        console.log(`[roomService] Deleting room with id: ${roomId}`);

        const response = await apiClient.delete<ApiResponse<RoomResponse>>(
            `${baseURL}/${roomId}`
        );

        if (response.data.statusCode === 200) {
            console.log(`[roomService] Room deleted successfully: ${roomId}`);
            return;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error(`[roomService] Error deleting room ${roomId}:`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa phòng';
        throw new Error(errorMessage);
    }
};
