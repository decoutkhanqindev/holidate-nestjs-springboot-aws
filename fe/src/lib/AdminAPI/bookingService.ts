// lib/AdminAPI/bookingService.ts
import apiClient, { ApiResponse } from '@/service/apiClient';
import type { Booking } from '@/types';

const baseURL = '/bookings';

// Interface từ API response (theo cấu trúc backend)
interface BookingResponse {
    id: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    room: {
        id: string;
        name: string;
        hotelId: string;
    };
    hotel: {
        id: string;
        name: string;
    };
    checkInDate: string; // ISO date format (YYYY-MM-DD)
    checkOutDate: string; // ISO date format (YYYY-MM-DD)
    numberOfNights: number;
    numberOfRooms: number;
    numberOfAdults: number;
    numberOfChildren: number;
    priceDetails: {
        basePrice: number;
        discountAmount: number;
        netPriceAfterDiscount: number;
        totalPrice: number;
        finalPrice: number; // Backend trả về finalPrice (tổng tiền sau thuế và phí)
        appliedDiscount?: {
            id: string;
            code: string;
            percentage: number;
        } | null;
        tax?: {
            name: string;
            percentage: number;
            amount: number;
        };
        serviceFee?: {
            name: string;
            percentage: number;
            amount: number;
        };
        fees?: Array<{ name: string; amount: number }>;
    };
    contactFullName: string;
    contactEmail: string;
    contactPhone: string;
    status: string; // Booking status (PENDING, CONFIRMED, CANCELLED, CHECKED_IN, COMPLETED)
    paymentUrl?: string;
    createdAt: string; // ISO datetime
    expiresAt?: string; // ISO datetime
    updatedAt?: string; // ISO datetime
}

interface PaginatedBookingResponse {
    content: BookingResponse[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Helper function để map từ BookingResponse sang Booking
function mapBookingResponseToBooking(response: BookingResponse): Booking {
    // Map booking status từ backend sang frontend BookingStatus
    // Theo API docs: pending_payment, confirmed, checked_in, cancelled, completed, rescheduled
    const statusMap: Record<string, 'COMPLETED' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN'> = {
        'COMPLETED': 'COMPLETED',
        'CONFIRMED': 'CONFIRMED',
        'PENDING': 'PENDING',
        'PENDING_PAYMENT': 'PENDING',
        'CANCELLED': 'CANCELLED',
        'CHECKED_IN': 'CHECKED_IN',
        // Thêm lowercase variants
        'completed': 'COMPLETED',
        'confirmed': 'CONFIRMED',
        'pending': 'PENDING',
        'pending_payment': 'PENDING',
        'cancelled': 'CANCELLED',
        'checked_in': 'CHECKED_IN',
        'rescheduled': 'CONFIRMED', // Rescheduled được coi như confirmed
    };

    // Map payment status theo API docs:
    // - confirmed/completed/checked_in/rescheduled → payment = SUCCESS → PAID
    // - pending_payment → payment = PENDING → PENDING
    // - cancelled → payment có thể = FAILED (chưa thanh toán) hoặc SUCCESS (đã hoàn tiền) → REFUNDED nếu đã thanh toán trước đó
    let paymentStatus: 'PAID' | 'UNPAID' | 'PENDING' | 'REFUNDED' = 'PENDING';
    const statusLower = response.status.toLowerCase();

    if (statusLower === 'confirmed' || statusLower === 'completed' || statusLower === 'checked_in' || statusLower === 'rescheduled') {
        // Booking đã confirmed → payment đã success
        paymentStatus = 'PAID';
    } else if (statusLower === 'pending_payment') {
        // Booking chờ thanh toán → payment pending
        paymentStatus = 'PENDING';
    } else if (statusLower === 'cancelled') {
        // Booking đã hủy → có thể payment failed (chưa thanh toán) hoặc success (đã hoàn tiền)
        // Nếu có paymentUrl trước đó (đã tạo payment) thì coi như đã hoàn tiền
        // Nếu không có paymentUrl thì chưa thanh toán → UNPAID
        paymentStatus = response.paymentUrl ? 'REFUNDED' : 'UNPAID';
    } else {
        // Trường hợp khác: mặc định là PENDING (chờ thanh toán)
        paymentStatus = response.paymentUrl ? 'PENDING' : 'UNPAID';
    }

    const statusUpper = response.status.toUpperCase();
    const bookingStatus = statusMap[response.status] || statusMap[statusUpper] || 'PENDING';

    return {
        id: response.id, // Backend trả về UUID string, giữ nguyên
        customerName: response.contactFullName || response.user.fullName,
        roomNumbers: [response.room.name], // Backend chỉ có 1 room, frontend có thể có nhiều
        checkInDate: new Date(response.checkInDate),
        checkOutDate: new Date(response.checkOutDate),
        totalAmount: response.priceDetails.finalPrice || response.priceDetails.totalPrice || 0, // Dùng finalPrice (tổng tiền sau thuế và phí) từ backend
        paymentStatus: paymentStatus,
        bookingStatus: bookingStatus,
        // Thêm các field mới
        email: response.contactEmail || response.user.email || '',
        phone: response.contactPhone || '',
        numberOfAdults: response.numberOfAdults || 0,
        numberOfChildren: response.numberOfChildren || 0,
    };
}

/**
 * Interface cho query parameters
 */
export interface GetBookingsParams {
    page?: number;
    size?: number;
    userId?: string;
    roomId?: string;
    hotelId?: string;
    status?: string;
    checkInDate?: string; // ISO date format
    checkOutDate?: string; // ISO date format
    createdFrom?: string; // ISO datetime format
    createdTo?: string; // ISO datetime format
    minPrice?: number;
    maxPrice?: number;
    contactEmail?: string;
    contactPhone?: string;
    contactFullName?: string;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
    // Thêm roleName và userId để log (backend sẽ tự động filter từ JWT token)
    roleName?: string;
    currentUserId?: string;
}

/**
 * Interface cho kết quả trả về
 */
export interface PaginatedBookingsResult {
    data: Booking[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
}

/**
 * Lấy danh sách bookings với phân trang
 * Backend sẽ tự động filter theo owner nếu role là PARTNER (từ JWT token)
 */
export async function getBookings(params: GetBookingsParams = {}): Promise<PaginatedBookingsResult> {
    try {
        const roleName = params.roleName; // Chỉ dùng để check xem có phải PARTNER không (không gửi user-id)
        const {
            page = 0, // Backend dùng 0-based index
            size = 10,
            userId,
            roomId,
            hotelId,
            status,
            checkInDate,
            checkOutDate,
            createdFrom,
            createdTo,
            minPrice,
            maxPrice,
            contactEmail,
            contactPhone,
            contactFullName,
            sortBy = 'createdAt',
            sortDir = 'DESC',
        } = params;

        console.log(`[bookingService] Fetching bookings:`, {
            page,
            size,
            hotelId, // PARTNER: chỉ cần hotelId
            status,
        });

        // Build query params
        const queryParams: any = {
            page,
            size,
            'sort-by': sortBy,
            'sort-dir': sortDir,
        };

        // Thêm các filter optional
        // Backend dùng kebab-case cho query params: 'user-id', 'room-id', 'hotel-id'
        // 
        // LOGIC QUAN TRỌNG:
        // - Khi client booking → userId trong booking là ID của client (đã được lưu trong booking)
        // - PARTNER (chủ khách sạn) muốn xem bookings → lấy theo hotelId (id khách sạn)
        // - USER muốn xem bookings của chính họ → lấy theo userId (id của user)
        // - ADMIN muốn xem tất cả bookings → không gửi filter hoặc gửi filter cụ thể
        //
        // Vì vậy:
        // - PARTNER: KHÔNG gửi 'user-id' (vì userId trong booking là của client, không phải của Partner)
        // - PARTNER: GỬI 'hotel-id' để filter bookings của hotels họ sở hữu
        if (userId && roleName?.toLowerCase() !== 'partner') {
            // Chỉ gửi user-id nếu không phải PARTNER
            // USER role dùng user-id để xem bookings của chính họ
            queryParams['user-id'] = userId;
        }
        if (roomId) queryParams['room-id'] = roomId;
        if (hotelId) queryParams['hotel-id'] = hotelId; // PARTNER cần gửi hotel-id để lấy bookings theo id khách sạn
        if (status) queryParams.status = status;
        if (checkInDate) queryParams.checkInDate = checkInDate;
        if (checkOutDate) queryParams.checkOutDate = checkOutDate;
        if (createdFrom) queryParams.createdFrom = createdFrom;
        if (createdTo) queryParams.createdTo = createdTo;
        if (minPrice !== undefined) queryParams.minPrice = minPrice;
        if (maxPrice !== undefined) queryParams.maxPrice = maxPrice;
        if (contactEmail) queryParams.contactEmail = contactEmail;
        if (contactPhone) queryParams.contactPhone = contactPhone;
        if (contactFullName) queryParams.contactFullName = contactFullName;

        console.log("[bookingService] ===== REQUEST DETAILS =====");
        console.log("[bookingService] Request params:", JSON.stringify(queryParams, null, 2));
        console.log("[bookingService] Hotel ID:", hotelId, hotelId ? "(PARTNER: lấy bookings theo id khách sạn)" : "");

        // Kiểm tra token trước khi gọi API
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("[bookingService] ⚠️ No accessToken found in localStorage!");
                throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
            }
            console.log("[bookingService] ✅ Token found in localStorage:", token.substring(0, 20) + '...');
            console.log("[bookingService] Token will be sent in Authorization header: Bearer <token>");
        }
        console.log("[bookingService] ===== END REQUEST DETAILS =====");

        const response = await apiClient.get<ApiResponse<PaginatedBookingResponse>>(
            baseURL,
            { params: queryParams }
        );

        console.log("[bookingService] ===== RESPONSE RECEIVED =====");
        console.log("[bookingService] HTTP Status:", response.status);
        console.log("[bookingService] Response statusCode:", response.data?.statusCode);
        console.log("[bookingService] Response message:", response.data?.message);
        console.log("[bookingService] Response has data:", !!response.data?.data);
        console.log("[bookingService] Response data type:", typeof response.data?.data);

        // Kiểm tra response structure
        if (!response.data) {
            console.error("[bookingService] ❌ Response không có data property");
            throw new Error('Phản hồi từ server không hợp lệ.');
        }

        if (response.data.statusCode !== 200) {
            console.error("[bookingService] ❌ Response statusCode không phải 200:", response.data.statusCode);
            console.error("[bookingService] Response message:", response.data.message);
            throw new Error(response.data.message || `Lỗi từ server (statusCode: ${response.data.statusCode})`);
        }

        if (!response.data.data) {
            console.warn("[bookingService] ⚠️ Response không có data.data");
            return {
                data: [],
                totalPages: 0,
                currentPage: 0,
                totalItems: 0,
            };
        }

        console.log("[bookingService] Response data structure:", {
            hasContent: !!response.data.data.content,
            contentLength: response.data.data.content?.length || 0,
            page: response.data.data.page,
            totalPages: response.data.data.totalPages,
            totalItems: response.data.data.totalItems,
        });

        try {
            // Kiểm tra content có tồn tại không
            if (!response.data.data.content || !Array.isArray(response.data.data.content)) {
                console.error("[bookingService] ❌ Response.data.data.content không phải array hoặc không tồn tại");
                console.error("[bookingService] Content value:", response.data.data.content);
                throw new Error('Dữ liệu bookings không hợp lệ từ server.');
            }

            const bookings = response.data.data.content.map((item: BookingResponse, index: number) => {
                try {
                    return mapBookingResponseToBooking(item);
                } catch (itemError: any) {
                    console.error(`[bookingService] ❌ Error mapping booking at index ${index}:`, itemError);
                    console.error(`[bookingService] Booking item:`, item);
                    throw new Error(`Lỗi khi xử lý booking ${index + 1}: ${itemError.message}`);
                }
            });

            console.log(`[bookingService] ✅ Successfully mapped ${bookings.length} bookings (page ${response.data.data.page + 1}/${response.data.data.totalPages})`);

            return {
                data: bookings,
                totalPages: response.data.data.totalPages,
                currentPage: response.data.data.page,
                totalItems: response.data.data.totalItems,
            };
        } catch (mapError: any) {
            console.error("[bookingService] ❌ Error mapping bookings:", mapError);
            console.error("[bookingService] Map error stack:", mapError.stack);
            throw new Error(`Lỗi khi xử lý dữ liệu bookings: ${mapError.message}`);
        }
    } catch (error: any) {
        console.error(`[bookingService] ===== ERROR CATCH BLOCK =====`);
        console.error(`[bookingService] Error type:`, error.constructor?.name);
        console.error(`[bookingService] Error message:`, error.message);
        console.error(`[bookingService] Error stack:`, error.stack);
        console.error(`[bookingService] Error response status:`, error.response?.status);
        console.error(`[bookingService] Error response statusText:`, error.response?.statusText);
        console.error(`[bookingService] Error response data:`, error.response?.data);
        console.error(`[bookingService] Error response headers:`, error.response?.headers);
        console.error(`[bookingService] Error config:`, {
            url: error.config?.url,
            method: error.config?.method,
            baseURL: error.config?.baseURL,
            params: error.config?.params,
        });

        // Xử lý các loại lỗi khác nhau
        if (error.response?.status === 401) {
            console.error("[bookingService] ⚠️ 401 Unauthorized - Token không hợp lệ hoặc đã hết hạn");
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
            console.error("[bookingService] ⚠️ 403 Forbidden - User không có quyền truy cập");
            console.error("[bookingService] ⚠️ Response data:", JSON.stringify(error.response?.data, null, 2));
            console.error("[bookingService] ⚠️ Expected roles for /bookings endpoint (theo API docs):");
            console.error("[bookingService] ⚠️   - USER");
            console.error("[bookingService] ⚠️   - PARTNER");
            console.error("[bookingService] ⚠️   - ADMIN");

            // Kiểm tra JWT token để xem role trong token
            if (typeof window !== 'undefined') {
                try {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        // Decode JWT token để xem role (không verify, chỉ decode)
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        console.error("[bookingService] ⚠️ JWT token payload (scope/roles):", payload.scope || payload.roles || payload.authorities || 'Not found');
                        console.error("[bookingService] ⚠️ JWT token full payload:", payload);

                        // Kiểm tra xem scope có đúng format không
                        const scope = payload.scope;
                        console.error("[bookingService] ⚠️ Scope type:", typeof scope);
                        console.error("[bookingService] ⚠️ Scope value:", scope);
                        if (typeof scope === 'string') {
                            console.error("[bookingService] ⚠️ ⚠️ VẤN ĐỀ: Scope là string đơn, backend JwtGrantedAuthoritiesConverter không parse được!");
                            console.error("[bookingService] ⚠️ ⚠️ Backend cần scope là array ['partner'] hoặc space-separated 'partner admin'");
                        }
                    }
                } catch (e) {
                    console.error("[bookingService] ⚠️ Cannot decode JWT token:", e);
                }
            }

            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Bạn không có quyền truy cập tài nguyên này.';
            throw new Error(errorMessage);
        } else if (error.response?.status === 404) {
            console.error("[bookingService] ⚠️ 404 Not Found - Endpoint không tồn tại");
            throw new Error('API endpoint không tồn tại.');
        } else if (error.response?.status === 200 && error.response?.data) {
            // Trường hợp đặc biệt: HTTP 200 nhưng có lỗi trong response.data
            console.warn("[bookingService] ⚠️ HTTP 200 nhưng có thể có lỗi trong response.data");
            console.warn("[bookingService] Response data:", error.response.data);
            if (error.response.data.statusCode !== 200) {
                throw new Error(error.response.data.message || 'Lỗi từ server');
            }
        } else {
            const errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Không thể tải danh sách đặt phòng';
            throw new Error(errorMessage);
        }
    }
    // TypeScript safety: function always returns or throws, but we need to satisfy the compiler
    // This line should never be reached
    throw new Error('Unexpected error in getBookings');
}

/**
 * Lấy thông tin một booking theo ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
    try {
        console.log(`[bookingService] Fetching booking with id: ${id}`);

        const response = await apiClient.get<ApiResponse<BookingResponse>>(
            `${baseURL}/${id}`
        );

        if (response.data.statusCode === 200 && response.data.data) {
            return mapBookingResponseToBooking(response.data.data);
        }

        return null;
    } catch (error: any) {
        console.error(`[bookingService] Error fetching booking ${id}:`, error);
        if (error.response?.status === 404) {
            return null;
        }
        throw new Error(error.response?.data?.message || 'Không thể tải thông tin đặt phòng');
    }
}
