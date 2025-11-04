// lib/Super_Admin/hotelAdminService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import { createServerApiClient } from '@/lib/AdminAPI/serverApiClient';
import type { HotelAdmin } from '@/types';
import { getHotels } from '@/lib/AdminAPI/hotelService';

const baseURL = '/users';

// Interface từ API response
interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: {
        id: string;
        name: string;
        description?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface HotelResponse {
    id: string;
    name: string;
    partner?: {
        id: string;
        name?: string;
        fullName?: string;
    };
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

/**
 * Map UserResponse (PARTNER role) sang HotelAdmin type
 */
function mapUserResponseToHotelAdmin(user: UserResponse, hotels: HotelResponse[]): HotelAdmin {
    console.log(`[mapUserResponseToHotelAdmin] Mapping user ${user.id} (${user.fullName})`);
    console.log(`[mapUserResponseToHotelAdmin] Total hotels to check: ${hotels.length}`);

    // Tìm hotels của partner này (hotels có partner.id === user.id)
    const partnerHotels = hotels.filter(hotel => {
        const matches = hotel.partner?.id === user.id;
        if (matches) {
            console.log(`[mapUserResponseToHotelAdmin] ✅ Found hotel ${hotel.name} (${hotel.id}) for partner ${user.id}`);
        }
        return matches;
    });

    console.log(`[mapUserResponseToHotelAdmin] Found ${partnerHotels.length} hotels for partner ${user.id}`);

    // Lấy hotel đầu tiên làm managedHotel (hoặc có thể hiển thị tất cả)
    const managedHotel = partnerHotels.length > 0
        ? partnerHotels[0]
        : { id: '', name: 'Chưa có khách sạn' };

    return {
        id: parseInt(user.id) || 0, // Frontend dùng number
        username: user.fullName, // Frontend dùng username, backend dùng fullName
        email: user.email,
        managedHotel: {
            id: managedHotel.id,
            name: managedHotel.name,
        },
        status: 'ACTIVE', // Backend không có status field trong UserResponse, mặc định ACTIVE
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    };
}

/**
 * Lấy danh sách Hotel Admins (users với role PARTNER)
 */
export async function getHotelAdmins({
    page = 1,
    limit = 10
}: {
    page?: number;
    limit?: number
}): Promise<{
    data: HotelAdmin[];
    totalPages: number;
    currentPage: number;
}> {
    try {
        console.log(`[hotelAdminService] Fetching hotel admins - page: ${page}, limit: ${limit}`);

        // Lấy tất cả users (chỉ ADMIN mới có quyền)
        const usersResponse = await apiClient.get<ApiResponse<UserResponse[]>>(baseURL);

        if (usersResponse.data?.statusCode === 200 && usersResponse.data?.data) {
            // Filter users với role PARTNER
            const partnerUsers = usersResponse.data.data.filter(
                user => user.role.name.toUpperCase() === 'PARTNER'
            );

            // Lấy tất cả hotels để map với partners
            // GET /accommodation/hotels có thể không trả về partner trong response
            // Cần fetch từng hotel detail để lấy partner info
            let allHotels: HotelResponse[] = [];
            try {
                // Bước 1: Lấy danh sách hotels (có thể không có partner info)
                const hotelsApiResponse = await apiClient.get<ApiResponse<PaginatedHotelResponse>>(
                    '/accommodation/hotels',
                    {
                        params: {
                            page: 0,
                            size: 1000,
                        }
                    }
                );

                if (hotelsApiResponse.data?.statusCode === 200 && hotelsApiResponse.data?.data) {
                    const rawHotels = hotelsApiResponse.data.data.content;
                    console.log(`[hotelAdminService] Fetched ${rawHotels.length} hotels from list endpoint`);

                    // Kiểm tra xem response có partner field không
                    const firstHotel = rawHotels[0];
                    if (firstHotel) {
                        const hasPartner = (firstHotel as any).partner !== undefined;
                        console.log(`[hotelAdminService] First hotel has partner field: ${hasPartner}`, (firstHotel as any).partner);
                    }

                    // Bước 2: Fetch partner info từ hotel detail nếu không có trong list response
                    // Hoặc nếu có partner trong response thì dùng luôn
                    const hotelsWithPartner = await Promise.all(
                        rawHotels.map(async (hotel: any) => {
                            // Kiểm tra xem có partner trong response không
                            let partnerId: string | undefined = undefined;

                            if (hotel.partner?.id) {
                                // Response đã có partner
                                partnerId = hotel.partner.id;
                            } else if (hotel.partnerId) {
                                // Response có partnerId trực tiếp
                                partnerId = hotel.partnerId;
                            } else {
                                // Không có partner trong response, fetch từ detail
                                try {
                                    const detailResponse = await apiClient.get<ApiResponse<any>>(
                                        `/accommodation/hotels/${hotel.id}`
                                    );
                                    if (detailResponse.data?.statusCode === 200 && detailResponse.data?.data?.partner?.id) {
                                        partnerId = detailResponse.data.data.partner.id;
                                    }
                                } catch (detailError) {
                                    console.warn(`[hotelAdminService] Could not fetch detail for hotel ${hotel.id}:`, detailError);
                                }
                            }

                            return {
                                id: hotel.id,
                                name: hotel.name,
                                partner: partnerId ? { id: partnerId } : undefined,
                            };
                        })
                    );

                    allHotels = hotelsWithPartner;
                    const hotelsWithPartners = allHotels.filter(h => h.partner);
                    console.log(`[hotelAdminService] ✅ Fetched ${allHotels.length} hotels, ${hotelsWithPartners.length} have partners`);
                }
            } catch (error) {
                console.warn('[hotelAdminService] Could not fetch hotels:', error);
                // Fallback: thử dùng getHotels nếu API trực tiếp fail
                try {
                    const hotelsResponse = await getHotels(0, 1000);
                    allHotels = hotelsResponse.hotels.map(hotel => ({
                        id: hotel.id,
                        name: hotel.name,
                        partner: hotel.ownerId ? { id: hotel.ownerId } : undefined,
                    }));
                    console.log(`[hotelAdminService] Fallback: Fetched ${allHotels.length} hotels, ${allHotels.filter(h => h.partner).length} have partners`);
                } catch (fallbackError) {
                    console.error('[hotelAdminService] Fallback also failed:', fallbackError);
                }
            }

            // Map sang HotelAdmin
            const hotelAdmins = partnerUsers.map(user =>
                mapUserResponseToHotelAdmin(user, allHotels)
            );

            // Phân trang ở frontend
            const totalItems = hotelAdmins.length;
            const totalPages = Math.ceil(totalItems / limit);
            const start = (page - 1) * limit;
            const end = start + limit;
            const paginatedData = hotelAdmins.slice(start, end);

            console.log(`[hotelAdminService] Hotel admins fetched: ${paginatedData.length} of ${hotelAdmins.length} total`);
            return {
                data: paginatedData,
                totalPages,
                currentPage: page,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[hotelAdminService] Error fetching hotel admins:', error);

        // Nếu là lỗi 403, trả về mảng rỗng
        if (error.response?.status === 403) {
            console.warn('[hotelAdminService] 403 Forbidden - User may not have permission');
            return {
                data: [],
                totalPages: 0,
                currentPage: page,
            };
        }

        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tải danh sách admin khách sạn';
        throw new Error(errorMessage);
    }
}

/**
 * Lấy danh sách hotels để chọn trong form
 */
export async function getHotelsForSelection(): Promise<Array<{ id: string; name: string }>> {
    try {
        const response = await getHotels(0, 1000); // Lấy tất cả hotels
        return response.hotels.map(hotel => ({
            id: hotel.id,
            name: hotel.name,
        }));
    } catch (error: any) {
        console.error('[hotelAdminService] Error fetching hotels for selection:', error);
        return [];
    }
}

/**
 * Tạo Hotel Admin mới (tạo user với role PARTNER) - Server version
 */
export async function createHotelAdminServer(payload: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    hotelId: string; // Hotel để gán cho partner
    authProvider?: string;
}): Promise<UserResponse> {
    try {
        console.log('[hotelAdminService] Creating hotel admin (server):', { email: payload.email, hotelId: payload.hotelId });

        // Bước 1: Lấy roleId của PARTNER
        const rolesResponse = await apiClient.get<ApiResponse<Array<{ id: string; name: string }>>>(`/roles`);
        const partnerRole = rolesResponse.data?.data?.find(role => role.name.toUpperCase() === 'PARTNER');

        if (!partnerRole) {
            throw new Error('Không tìm thấy role PARTNER');
        }

        // Bước 2: Tạo user với role PARTNER
        const serverClient = await createServerApiClient();
        const userPayload = {
            email: payload.email.trim(),
            password: payload.password.trim(),
            fullName: payload.fullName.trim(),
            phoneNumber: payload.phoneNumber?.trim() || undefined,
            roleId: partnerRole.id,
            authProvider: payload.authProvider || 'LOCAL',
        };

        const userResponse = await serverClient.post<ApiResponse<UserResponse>>(baseURL, userPayload);

        if (userResponse.data?.statusCode === 200 && userResponse.data?.data) {
            const newUser = userResponse.data.data;

            // Note: HotelUpdateRequest không có partnerId field
            // Không thể update partner của hotel sau khi hotel đã được tạo
            // Partner sẽ được gán khi tạo hotel mới (trong HotelCreationRequest có partnerId)
            // Hoặc hotel đã có partner rồi thì không thể thay đổi qua API update

            // Nếu cần gán hotel cho partner, có thể:
            // 1. Chỉ cho phép tạo Hotel Admin cho hotels chưa có partner
            // 2. Hoặc yêu cầu tạo hotel mới với partnerId của partner này
            // 3. Hoặc backend cần hỗ trợ endpoint riêng để gán partner cho hotel

            if (payload.hotelId) {
                console.log(`[hotelAdminService] ⚠️ Note: Hotel ${payload.hotelId} cannot be assigned to partner via API update. Partner ID: ${newUser.id}`);
                console.log(`[hotelAdminService] 💡 Suggestion: Hotel should be assigned to partner when creating new hotel, or use separate endpoint if available.`);
            }

            console.log('[hotelAdminService] ✅ Hotel admin created successfully (server)');
            return newUser;
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        console.error('[hotelAdminService] Error creating hotel admin (server):', error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể tạo admin khách sạn';
        throw new Error(errorMessage);
    }
}

/**
 * Xóa Hotel Admin (xóa user) - Server version
 */
export async function deleteHotelAdminServer(userId: string): Promise<void> {
    try {
        console.log(`[hotelAdminService] Deleting hotel admin ${userId} (server)`);

        const serverClient = await createServerApiClient();
        const response = await serverClient.delete<ApiResponse<UserResponse>>(`${baseURL}/${userId}`);

        if (response.data?.statusCode === 200 || response.status === 200 || response.status === 204) {
            console.log(`[hotelAdminService] ✅ Hotel admin deleted successfully (server): ${userId}`);
            return;
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        console.error(`[hotelAdminService] Error deleting hotel admin ${userId} (server):`, error);
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa admin khách sạn';
        throw new Error(errorMessage);
    }
}
