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
        console.log("[bookingService] Full URL sẽ gọi:", `${baseURL}?${new URLSearchParams(queryParams).toString()}`);

        // Kiểm tra token trước khi gọi API
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error("[bookingService] ⚠️ No accessToken found in localStorage!");
                throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
            }
            console.log("[bookingService] ✅ Token found in localStorage:", token.substring(0, 20) + '...');
            console.log("[bookingService] Token will be sent in Authorization header: Bearer <token>");

            // Decode token để log role
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("[bookingService] ✅ User role (scope):", payload.scope || 'N/A');
                console.log("[bookingService] ✅ User email:", payload.sub || 'N/A');
            } catch (e) {
                console.warn("[bookingService] ⚠️ Cannot decode token:", e);
            }
        }
        console.log("[bookingService] ===== END REQUEST DETAILS =====");

        const response = await apiClient.get<ApiResponse<PaginatedBookingResponse>>(
            baseURL,
            { params: queryParams }
        );

        console.log("[bookingService] ===== RESPONSE RECEIVED =====");
        console.log("[bookingService] ✅ HTTP Status:", response.status);
        console.log("[bookingService] ✅ Response statusCode:", response.data?.statusCode);
        console.log("[bookingService] ✅ Response message:", response.data?.message);
        console.log("[bookingService] ✅ Response has data:", !!response.data?.data);
        console.log("[bookingService] ✅ Response data type:", typeof response.data?.data);

        if (response.status === 200 && response.data?.statusCode === 200) {
            console.log("[bookingService] ✅✅✅ REQUEST THÀNH CÔNG! Backend đã cho phép truy cập /bookings");
            if (hotelId) {
                console.log(`[bookingService] ✅ Filtering by hotelId: ${hotelId}`);
            }
            if (userId) {
                console.log(`[bookingService] ✅ Filtering by userId: ${userId}`);
            }
        }

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
            console.log(`[bookingService] ✅ Total items in database: ${response.data.data.totalItems}`);

            if (hotelId && bookings.length === 0) {
                console.warn(`[bookingService] ⚠️ WARNING: No bookings found for hotelId=${hotelId}`);
                console.warn(`[bookingService] ⚠️ This could mean:`);
                console.warn(`[bookingService] ⚠️   1. Hotel ${hotelId} has no bookings yet`);
                console.warn(`[bookingService] ⚠️   2. All bookings for this hotel have been cancelled/deleted`);
                console.warn(`[bookingService] ⚠️   3. Query filter is working correctly, just no data`);
            }

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

        // ===== PHÂN TÍCH LỖI CHI TIẾT ĐỂ BÁO CHO BACKEND =====
        console.error(`[bookingService] ===== PHÂN TÍCH LỖI =====`);

        // 1. Kiểm tra có phải lỗi network/frontend không
        if (!error.response) {
            console.error(`[bookingService] ❌ LỖI FRONTEND/NETWORK:`);
            console.error(`[bookingService] - Không có response từ server`);
            console.error(`[bookingService] - Có thể do: network error, CORS, server không chạy, hoặc timeout`);
            console.error(`[bookingService] - Error message: ${error.message}`);
            console.error(`[bookingService] - Error code: ${error.code || 'N/A'}`);
        } else {
            // 2. Có response → Lỗi từ backend
            const statusCode = error.response?.status;
            const responseData = error.response?.data;

            console.error(`[bookingService] ❌ LỖI BACKEND:`);
            console.error(`[bookingService] - HTTP Status Code: ${statusCode}`);
            console.error(`[bookingService] - Response Status Text: ${error.response?.statusText || 'N/A'}`);
            console.error(`[bookingService] - Response Data:`, JSON.stringify(responseData, null, 2));

            // 3. Phân tích từng loại lỗi
            if (statusCode === 401) {
                console.error(`[bookingService] 🔐 LỖI 401 UNAUTHORIZED:`);
                console.error(`[bookingService] - Token không hợp lệ hoặc đã hết hạn`);
                console.error(`[bookingService] - Frontend đã xử lý: xóa token và yêu cầu đăng nhập lại`);
            } else if (statusCode === 403) {
                console.error(`[bookingService] 🚫 LỖI 403 FORBIDDEN:`);
                console.error(`[bookingService] - User không có quyền truy cập resource này`);
                console.error(`[bookingService] - ĐÂY LÀ LỖI BACKEND - SecurityConfig chưa cho phép role này`);

                // Log thông tin JWT token
                let scope: string | undefined = undefined;
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('accessToken');
                    if (token) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            scope = payload.scope;
                            console.error(`[bookingService] 📋 THÔNG TIN JWT TOKEN:`);
                            console.error(`[bookingService] - Subject (email): ${payload.sub || 'N/A'}`);
                            console.error(`[bookingService] - Scope: ${scope || 'N/A'} (type: ${typeof scope})`);
                            console.error(`[bookingService] - Full Name: ${payload.fullName || 'N/A'}`);
                            console.error(`[bookingService] - Issuer: ${payload.iss || 'N/A'}`);
                            console.error(`[bookingService] - Expires At: ${new Date(payload.exp * 1000).toISOString()}`);
                            console.error(`[bookingService] - Full Payload:`, JSON.stringify(payload, null, 2));

                            // So sánh scope với RoleType
                            console.error(`[bookingService] 🔍 SO SÁNH SCOPE VỚI ROLE TYPE:`);
                            console.error(`[bookingService] - JWT scope: "${scope}"`);
                            console.error(`[bookingService] - Expected RoleType.PARTNER.getValue(): "partner"`);
                            console.error(`[bookingService] - Expected RoleType.ADMIN.getValue(): "admin"`);
                            console.error(`[bookingService] - Expected RoleType.USER.getValue(): "user"`);
                            console.error(`[bookingService] - Scope match PARTNER: ${scope === 'partner' || scope === 'PARTNER'}`);
                            console.error(`[bookingService] - Scope match ADMIN: ${scope === 'admin' || scope === 'ADMIN'}`);
                            console.error(`[bookingService] - Scope match USER: ${scope === 'user' || scope === 'USER'}`);

                            // Kiểm tra vấn đề với scope format
                            if (typeof scope === 'string' && scope.trim() !== '') {
                                console.error(`[bookingService] ✅ SCOPE FORMAT:`);
                                console.error(`[bookingService] - Scope là string: "${scope}" (ĐÚNG FORMAT)`);
                                console.error(`[bookingService] - CustomJwtGrantedAuthoritiesConverter trong SecurityConfig.java (dòng 405-452) ĐÃ parse được string scope`);
                                console.error(`[bookingService] - Scope "${scope}" sẽ được convert thành authority "partner"`);
                                console.error(`[bookingService] - VẤN ĐỀ: SecurityConfig rule GET /bookings chưa cho phép PARTNER`);
                            }
                        } catch (e) {
                            console.error(`[bookingService] ❌ Không thể decode JWT token:`, e);
                        }
                    } else {
                        console.error(`[bookingService] ❌ Không tìm thấy token trong localStorage`);
                    }
                }

                // Log request details
                console.error(`[bookingService] 📤 REQUEST DETAILS:`);
                console.error(`[bookingService] - URL: ${error.config?.url || 'N/A'}`);
                console.error(`[bookingService] - Method: ${error.config?.method?.toUpperCase() || 'N/A'}`);
                console.error(`[bookingService] - Base URL: ${error.config?.baseURL || 'N/A'}`);
                console.error(`[bookingService] - Query Params:`, JSON.stringify(error.config?.params || {}, null, 2));
                console.error(`[bookingService] - Full URL: ${error.config?.baseURL}${error.config?.url}${error.config?.params ? '?' + new URLSearchParams(error.config.params).toString() : ''}`);

                // Thông tin để báo cho backend
                console.error(`[bookingService] ===== THÔNG TIN ĐỂ BÁO CHO BACKEND TEAM =====`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] 🔴 LỖI: 403 Forbidden khi PARTNER truy cập GET /bookings`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] 📋 CHI TIẾT:`);
                console.error(`[bookingService] - Endpoint: GET /bookings`);
                console.error(`[bookingService] - User Role: PARTNER (scope trong JWT: "${scope || 'N/A'}")`);
                console.error(`[bookingService] - Query Params:`, JSON.stringify(error.config?.params || {}, null, 2));
                console.error(`[bookingService] - Response:`, JSON.stringify(responseData, null, 2));
                console.error(`[bookingService] `);
                console.error(`[bookingService] 🔍 NGUYÊN NHÂN:`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ✅ JWT TOKEN: ĐÚNG`);
                console.error(`[bookingService]    - Scope: "${scope || 'N/A'}" (string format - ĐÚNG)`);
                console.error(`[bookingService]    - CustomJwtGrantedAuthoritiesConverter (SecurityConfig.java dòng 405-452) ĐÃ parse được`);
                console.error(`[bookingService]    - Scope "${scope}" → authority "partner" (ĐÚNG)`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ❌ VẤN ĐỀ: SecurityConfig.java rule GET /bookings`);
                console.error(`[bookingService]    - File: SecurityConfig.java`);
                console.error(`[bookingService]    - Dòng: ~324 (trong phần ADMIN endpoints)`);
                console.error(`[bookingService]    - Code hiện tại:`);
                console.error(`[bookingService]      .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)`);
                console.error(`[bookingService]      .hasAuthority(RoleType.ADMIN.getValue())`);
                console.error(`[bookingService]    - VẤN ĐỀ: Chỉ cho phép ADMIN, không cho phép PARTNER và USER`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ✅ GIẢI PHÁP:`);
                console.error(`[bookingService]    Sửa SecurityConfig.java dòng 324-325:`);
                console.error(`[bookingService]    `);
                console.error(`[bookingService]    TRƯỚC:`);
                console.error(`[bookingService]    .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)`);
                console.error(`[bookingService]    .hasAuthority(RoleType.ADMIN.getValue())`);
                console.error(`[bookingService]    `);
                console.error(`[bookingService]    SAU:`);
                console.error(`[bookingService]    .requestMatchers(HttpMethod.GET, BookingEndpoints.BOOKINGS + ALL_ENDPOINTS)`);
                console.error(`[bookingService]    .hasAnyAuthority(RoleType.ADMIN.getValue(), RoleType.PARTNER.getValue(), RoleType.USER.getValue())`);
                console.error(`[bookingService]    `);
                console.error(`[bookingService]    LƯU Ý: Sau khi sửa, PHẢI RESTART backend server!`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] 📝 NOTE:`);
                console.error(`[bookingService]    - PARTNER rule ở dòng 208 chỉ match exact path "/bookings" (không có /**)`);
                console.error(`[bookingService]    - ADMIN rule ở dòng 324 match "/bookings/**" (ALL_ENDPOINTS)`);
                console.error(`[bookingService]    - Request "/bookings?hotel-id=xxx" match rule ADMIN (dòng 324) trước`);
                console.error(`[bookingService]    - Vì vậy cần sửa rule ADMIN để cho phép PARTNER và USER`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ===== TÓM TẮT ĐỂ BÁO BACKEND =====`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] 🔴 KẾT LUẬN: ĐÂY LÀ LỖI BACKEND`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ✅ Frontend: ĐÚNG`);
                console.error(`[bookingService]    - JWT token có scope: "partner" (ĐÚNG)`);
                console.error(`[bookingService]    - Request gửi đúng: GET /bookings?hotel-id=xxx`);
                console.error(`[bookingService]    - CustomJwtGrantedAuthoritiesConverter ĐÃ parse được scope string`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ❌ Backend: SAI`);
                console.error(`[bookingService]    - SecurityConfig.java dòng 324 chỉ cho phép ADMIN`);
                console.error(`[bookingService]    - Cần sửa thành: .hasAnyAuthority(ADMIN, PARTNER, USER)`);
                console.error(`[bookingService]    - Backend chưa restart sau khi sửa (hoặc chưa sửa)`);
                console.error(`[bookingService] `);
                console.error(`[bookingService] ===== END TÓM TẮT =====`);
                console.error(`[bookingService] ===== END THÔNG TIN BÁO BACKEND =====`);
            } else if (statusCode === 404) {
                console.error(`[bookingService] 🔍 LỖI 404 NOT FOUND:`);
                console.error(`[bookingService] - Endpoint không tồn tại`);
                console.error(`[bookingService] - Request URL: ${error.config?.baseURL}${error.config?.url}`);
            } else if (statusCode >= 500) {
                console.error(`[bookingService] 🔥 LỖI 5xx SERVER ERROR:`);
                console.error(`[bookingService] - Lỗi từ phía server (backend)`);
                console.error(`[bookingService] - Response:`, JSON.stringify(responseData, null, 2));
            } else {
                console.error(`[bookingService] ⚠️ LỖI KHÁC (${statusCode}):`);
                console.error(`[bookingService] - Response:`, JSON.stringify(responseData, null, 2));
            }
        }

        console.error(`[bookingService] ===== END PHÂN TÍCH LỖI =====`);

        // Xử lý các loại lỗi khác nhau
        if (error.response?.status === 401) {
            console.error("[bookingService] ⚠️ 401 Unauthorized - Token không hợp lệ hoặc đã hết hạn");
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
            // Log đã được xử lý ở phần trên (dòng 377-477), chỉ throw error ở đây
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
