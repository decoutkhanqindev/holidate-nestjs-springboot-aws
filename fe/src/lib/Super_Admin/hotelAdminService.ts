// lib/Super_Admin/hotelAdminService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import { createServerApiClient } from '@/lib/AdminAPI/serverApiClient';
import type { HotelAdmin } from '@/types';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { getPartnerRole } from '@/lib/AdminAPI/roleService';

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
    // Tìm hotels của partner này (hotels có partner.id === user.id)
    const partnerHotels = hotels.filter(hotel => {
        return hotel.partner?.id === user.id;
    });

    // Lấy hotel đầu tiên làm managedHotel (hoặc có thể hiển thị tất cả)
    const managedHotel = partnerHotels.length > 0
        ? partnerHotels[0]
        : { id: '', name: 'Chưa có khách sạn' };

    return {
        id: parseInt(user.id) || 0, // For display/compatibility (parsed from UUID, may be 0 if not a valid number)
        userId: user.id, // UUID string from backend - use this for API calls
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
                                    // Ignore error when fetching hotel detail
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
                }
            } catch (error) {
                // Fallback: thử dùng getHotels nếu API trực tiếp fail
                try {
                    const hotelsResponse = await getHotels(0, 1000);
                    allHotels = hotelsResponse.hotels.map(hotel => ({
                        id: hotel.id,
                        name: hotel.name,
                        partner: hotel.ownerId ? { id: hotel.ownerId } : undefined,
                    }));
                } catch (fallbackError) {
                    // Ignore fallback error
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

            return {
                data: paginatedData,
                totalPages,
                currentPage: page,
            };
        }

        throw new Error('Invalid response from server');
    } catch (error: any) {
        // Nếu là lỗi 403, trả về mảng rỗng
        if (error.response?.status === 403) {
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
    hotelId?: string; // Hotel để gán cho partner - optional vì có thể không chọn hotel
    authProvider?: string;
}): Promise<UserResponse> {
    try {
        // Bước 1: Lấy roleId của PARTNER (mặc định role là PARTNER)
        // API GET /roles yêu cầu ADMIN role, nên dùng serverClient
        let partnerRoleId: string | null = null;
        const serverClient = await createServerApiClient();
        
        console.log('[createHotelAdminServer] Starting to find PARTNER roleId...');
        
        // Thử 1: Lấy từ API /roles (yêu cầu ADMIN role)
        try {
            console.log('[createHotelAdminServer] Attempting to fetch roles from /roles API...');
            const rolesResponse = await serverClient.get<ApiResponse<Array<{ id: string; name: string; description?: string }>>>(`/roles`);
            console.log('[createHotelAdminServer] /roles API response:', {
                statusCode: rolesResponse.data?.statusCode,
                dataLength: rolesResponse.data?.data?.length || 0,
                roles: rolesResponse.data?.data?.map(r => ({ id: r.id, name: r.name }))
            });
            
            if (rolesResponse.data?.statusCode === 200 && rolesResponse.data?.data) {
                // Tìm role PARTNER với nhiều cách so sánh
                const partnerRole = rolesResponse.data.data.find(role => {
                    const roleName = (role.name || '').trim().toLowerCase();
                    return roleName === 'partner';
                });
                
                if (partnerRole && partnerRole.id) {
                    partnerRoleId = partnerRole.id;
                    console.log('[createHotelAdminServer] ✅ Found PARTNER roleId from /roles API:', partnerRoleId);
                } else {
                    console.warn('[createHotelAdminServer] ⚠️ PARTNER role not found in /roles API response. Available roles:', rolesResponse.data.data.map(r => r.name));
                }
            } else {
                console.warn('[createHotelAdminServer] ⚠️ /roles API response invalid:', rolesResponse.data);
            }
        } catch (error: any) {
            console.error('[createHotelAdminServer] ❌ Error fetching roles from /roles API:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
        }

        // Thử 2: Nếu không tìm thấy, lấy từ danh sách users PARTNER có sẵn
        if (!partnerRoleId) {
            try {
                console.log('[createHotelAdminServer] Attempting to find PARTNER roleId from existing users...');
                const usersResponse = await serverClient.get<ApiResponse<UserResponse[]>>(baseURL);
                console.log('[createHotelAdminServer] Users API response:', {
                    statusCode: usersResponse.data?.statusCode,
                    dataLength: usersResponse.data?.data?.length || 0
                });
                
                if (usersResponse.data?.statusCode === 200 && usersResponse.data?.data) {
                    const partnerUsers = usersResponse.data.data.filter(
                        user => user.role && (user.role.name || '').trim().toLowerCase() === 'partner'
                    );
                    console.log('[createHotelAdminServer] Found', partnerUsers.length, 'partner users');
                    
                    if (partnerUsers.length > 0 && partnerUsers[0].role?.id) {
                        partnerRoleId = partnerUsers[0].role.id;
                        console.log('[createHotelAdminServer] ✅ Found PARTNER roleId from existing users:', partnerRoleId);
                    } else {
                        console.warn('[createHotelAdminServer] ⚠️ No partner users found or users without role');
                    }
                }
            } catch (error: any) {
                console.error('[createHotelAdminServer] ❌ Error fetching users:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
            }
        }

        // Nếu vẫn không tìm thấy
        if (!partnerRoleId) {
            const errorMsg = 'Không tìm thấy role PARTNER. Vui lòng đảm bảo role PARTNER đã được tạo trong hệ thống và bạn có quyền ADMIN để truy cập API /roles.';
            console.error('[createHotelAdminServer] ❌', errorMsg);
            throw new Error(errorMsg);
        }
        
        console.log('[createHotelAdminServer] ✅ Final PARTNER roleId:', partnerRoleId);

        // Bước 2: Tạo user với role PARTNER (serverClient đã được tạo ở trên)
        // Chỉ gửi phoneNumber nếu có giá trị và không rỗng, đúng format
        const userPayload: any = {
            email: payload.email.trim(),
            password: payload.password.trim(),
            fullName: payload.fullName.trim(),
            roleId: partnerRoleId,
            authProvider: (payload.authProvider || 'LOCAL').toLowerCase(), // Backend yêu cầu lowercase: "local" không phải "LOCAL"
        };

        // Chỉ thêm phoneNumber nếu có giá trị hợp lệ và đúng format
        // Backend pattern: ^(\+84|0)[0-9]{9,10}$
        // Nếu phoneNumber không hợp lệ, không gửi (để null như các user thành công trong Postman)
        if (payload.phoneNumber && payload.phoneNumber.trim()) {
            const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
            const trimmedPhone = payload.phoneNumber.trim();
            if (phoneRegex.test(trimmedPhone)) {
                userPayload.phoneNumber = trimmedPhone;
            } else {
                console.warn('[createHotelAdminServer] PhoneNumber không đúng format, bỏ qua:', trimmedPhone);
                // Không thêm phoneNumber vào payload (để null như Postman)
            }
        }

        console.log('[createHotelAdminServer] Creating user with payload:', {
            email: userPayload.email,
            fullName: userPayload.fullName,
            roleId: userPayload.roleId,
            authProvider: userPayload.authProvider,
            hasPassword: !!userPayload.password,
            passwordLength: userPayload.password?.length || 0,
            phoneNumber: userPayload.phoneNumber || 'N/A'
        });

        console.log('[createHotelAdminServer] Sending POST request to:', baseURL);
        const userResponse = await serverClient.post<ApiResponse<UserResponse>>(baseURL, userPayload);
        console.log('[createHotelAdminServer] User creation response:', {
            statusCode: userResponse.data?.statusCode,
            hasData: !!userResponse.data?.data,
            userId: userResponse.data?.data?.id,
            userEmail: userResponse.data?.data?.email,
            userRole: userResponse.data?.data?.role?.name
        });

        if (userResponse.data?.statusCode === 200 && userResponse.data?.data) {
            const newUser = userResponse.data.data;
            console.log('[createHotelAdminServer] ✅ User created successfully:', {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                roleId: newUser.role?.id,
                roleName: newUser.role?.name
            });

            // QUAN TRỌNG: User mới tạo có active = false, cần activate để có thể login
            // Gọi API Update User với active = true để activate account
            try {
                console.log('[createHotelAdminServer] Attempting to activate user by calling update API with active=true...');
                
                const { updateUserServer } = await import('@/lib/AdminAPI/userService');
                
                // Gọi update với active = true để activate account
                await updateUserServer(newUser.id, {
                    active: true
                });
                
                console.log('[createHotelAdminServer] ✅ User activated successfully via update API');
            } catch (updateError: any) {
                console.error('[createHotelAdminServer] ⚠️ Error activating user via update API:', {
                    message: updateError.message,
                    status: updateError.response?.status,
                    responseData: updateError.response?.data
                });
                // Không throw error vì user đã được tạo thành công
                // Chỉ log warning
                console.warn('[createHotelAdminServer] ⚠️ User created but activation failed. User may need manual activation.');
            }

            // Note: HotelUpdateRequest không có partnerId field
            // Không thể update partner của hotel sau khi hotel đã được tạo
            // Partner sẽ được gán khi tạo hotel mới (trong HotelCreationRequest có partnerId)
            // Hoặc hotel đã có partner rồi thì không thể thay đổi qua API update

            // Nếu cần gán hotel cho partner, có thể:
            // 1. Chỉ cho phép tạo Hotel Admin cho hotels chưa có partner
            // 2. Hoặc yêu cầu tạo hotel mới với partnerId của partner này
            // 3. Hoặc backend cần hỗ trợ endpoint riêng để gán partner cho hotel

            return newUser;
        }

        console.error('[createHotelAdminServer] ❌ Invalid response from server:', userResponse.data);
        throw new Error('Invalid response from server');
    } catch (error: any) {
        // Log chi tiết toàn bộ error response
        console.error('[createHotelAdminServer] ❌ Error creating hotel admin - Full Error Details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            headers: error.response?.headers,
            responseData: error.response?.data,
            responseDataString: JSON.stringify(error.response?.data, null, 2),
            requestUrl: error.config?.url,
            requestMethod: error.config?.method,
            requestData: error.config?.data
        });
        
        // Xử lý lỗi validation từ backend
        let errorMessage = 'Không thể tạo admin khách sạn';
        
        if (error.response?.status === 400) {
            // Lỗi validation (400 Bad Request)
            const errorData = error.response?.data;
            
            // Thử nhiều cách để lấy message
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.data?.message) {
                errorMessage = errorData.data.message;
            } else if (errorData?.error) {
                // Spring Boot default error format
                errorMessage = `${errorData.error}: ${errorData.message || 'Dữ liệu không hợp lệ'}`;
                // Nếu có validation errors chi tiết
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const validationErrors = errorData.errors.map((e: any) => e.defaultMessage || e.message).join(', ');
                    errorMessage += ` (${validationErrors})`;
                }
            } else if (errorData?.statusCode) {
                // ApiResponse format
                errorMessage = errorData.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.';
            } else {
                // Fallback với thông tin chi tiết hơn
                errorMessage = `Dữ liệu không hợp lệ. Backend response: ${JSON.stringify(errorData)}`;
            }
        } else if (error.response?.status === 500) {
            // Lỗi server (500 Internal Server Error)
            const errorData = error.response?.data;
            console.error('[createHotelAdminServer] ⚠️ Server error (500). Backend may have encountered an unexpected exception.');
            
            // Thử lấy message từ ApiResponse format
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.data?.message) {
                errorMessage = errorData.data.message;
            } else if (errorData?.statusCode === 500 && errorData?.message) {
                errorMessage = errorData.message;
            } else {
                errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau hoặc kiểm tra logs phía backend để biết chi tiết.';
            }
        } else if (error.response?.status === 404) {
            errorMessage = error.response?.data?.message || error.response?.data?.error || 'Không tìm thấy tài nguyên. Vui lòng thử lại.';
        } else if (error.response?.status === 403) {
            errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (error.response?.status === 409) {
            // Conflict - có thể là email đã tồn tại
            const errorData = error.response?.data;
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (errorData?.data?.message) {
                errorMessage = errorData.data.message;
            } else {
                errorMessage = 'Email đã tồn tại trong hệ thống. Vui lòng sử dụng email khác.';
            }
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.data?.message) {
            errorMessage = error.response.data.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error('[createHotelAdminServer] Final error message:', errorMessage);
        throw new Error(errorMessage);
    }
}

/**
 * Xóa Hotel Admin (xóa user) - Server version
 */
export async function deleteHotelAdminServer(userId: string): Promise<void> {
    try {
        const serverClient = await createServerApiClient();
        const response = await serverClient.delete<ApiResponse<UserResponse>>(`${baseURL}/${userId}`);

        if (response.data?.statusCode === 200 || response.status === 200 || response.status === 204) {
            return;
        }

        throw new Error(`Invalid response status: ${response.status}`);
    } catch (error: any) {
        const errorMessage = error.response?.data?.message
            || error.message
            || 'Không thể xóa admin khách sạn';
        throw new Error(errorMessage);
    }
}
