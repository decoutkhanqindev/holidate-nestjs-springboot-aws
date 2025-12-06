// src/service/bookingService.ts

import apiClient, { ApiResponse } from './apiClient';

// === INTERFACES CHUNG ===
export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
}

// CẬP NHẬT: Interface BookingResponse bây giờ sẽ chứa đầy đủ thông tin chi tiết
export interface BookingResponse {
    id: string;
    hotel: {
        id: string;
        name: string;
        address?: string;
        street?: { name: string };
        ward?: { name: string };
        district?: { name: string };
        city?: { name: string };
    };
    room: {
        id: string;
        name: string;
        photos?: { photos: { url: string }[] }[]; // Mảng ảnh
        amenities?: { name: string, amenities: { name: string }[] }[]; // Mảng tiện nghi
    };
    checkInDate: string;
    checkOutDate: string;
    status: string;
    createdAt: string;
    numberOfAdults: number;
    numberOfChildren: number;
    contactFullName?: string;
    contactEmail?: string;
    contactPhone?: string;
    priceDetails: {
        originalPrice?: number;
        discountAmount?: number;
        netPriceAfterDiscount?: number;
        tax?: { name: string; percentage: number; amount: number };
        serviceFee?: { name: string; percentage: number; amount: number };
        finalPrice: number;
        appliedDiscount?: { code: string } | null;
    };
    paymentUrl?: string; // URL thanh toán (chỉ có khi status là pending_payment)
}

// === INTERFACES CHO TỪNG API ===

export interface CreateBookingPayload { userId: string; roomId: string; hotelId: string; checkInDate: string; checkOutDate: string; numberOfRooms: number; numberOfAdults: number; numberOfChildren: number; contactFullName: string; contactEmail: string; contactPhone: string; discountCode?: string; }
export interface CreateBookingResponse { id: string; paymentUrl: string; status: string; }
export interface BookingPricePreviewPayload { roomId: string; startDate: string; endDate: string; numberOfRooms: number; numberOfAdults: number; numberOfChildren: number; discountCode?: string; }
export interface BookingPriceDetailsResponse { originalPrice: number; discountAmount: number; netPriceAfterDiscount: number; tax: { name: string; percentage: number; amount: number }; serviceFee: { name: string; percentage: number; amount: number }; finalPrice: number; appliedDiscount: { code: string; } | null; }
export interface RescheduleBookingPayload { newCheckInDate: string; newCheckOutDate: string; }
export interface RescheduleBookingResponse { id: string; status: string; priceDifference: number; paymentUrl?: string; }


// === SERVICE CLASS ===

class BookingService {
    private api = apiClient;

    async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
        try {
            // Log để debug
            console.log('[BookingService] Gửi request tạo booking:', {
                ...payload,
                contactPhone: payload.contactPhone ? '***' : 'MISSING'
            });

            const response = await this.api.post<ApiResponse<CreateBookingResponse>>('/bookings', payload);

            if (response.data?.data?.paymentUrl) {
                return response.data.data;
            }
            throw new Error("Phản hồi không hợp lệ.");
        } catch (error: any) {
            // Log chi tiết lỗi để debug
            console.error('[BookingService] Lỗi khi tạo booking:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                payload: {
                    ...payload,
                    contactPhone: payload.contactPhone ? '***' : 'MISSING'
                }
            });

            // Map error message từ backend sang message dễ hiểu hơn
            let errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Không thể tạo yêu cầu đặt phòng.';

            // Map các error key từ backend sang message tiếng Việt
            const errorMessageMap: { [key: string]: string } = {
                'CONTACT_PHONE_NOT_BLANK': 'Vui lòng nhập số điện thoại liên lạc.',
                'CONTACT_PHONE_INVALID': 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam .',
                'CONTACT_FULL_NAME_NOT_BLANK': 'Vui lòng nhập họ và tên liên lạc.',
                'CONTACT_EMAIL_NOT_BLANK': 'Vui lòng nhập email liên lạc.',
                'CONTACT_EMAIL_INVALID': 'Email không hợp lệ.',
                'Contact phone is required': 'Vui lòng nhập số điện thoại liên lạc.',
            };

            // Kiểm tra xem error message có trong map không
            if (errorMessageMap[errorMessage]) {
                errorMessage = errorMessageMap[errorMessage];
            }

            throw new Error(errorMessage);
        }
    }

    async getBookingPricePreview(payload: BookingPricePreviewPayload): Promise<BookingPriceDetailsResponse> {
        try {
            const response = await this.api.post<ApiResponse<BookingPriceDetailsResponse>>('/bookings/price-preview', payload);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Cấu trúc phản hồi không hợp lệ.");
        } catch (error: any) {
            // Map error message từ backend sang message dễ hiểu hơn
            let errorMessage = error.response?.data?.message
                || error.response?.data?.error
                || error.message
                || 'Không thể xem trước giá phòng.';

            // Map các error key từ backend sang message tiếng Việt rõ ràng hơn
            const errorMessageMap: { [key: string]: string } = {
                'ROOM_NOT_AVAILABLE': 'Phòng không khả dụng cho các ngày đã chọn. Vui lòng thử chọn ngày khác hoặc liên hệ khách sạn để được hỗ trợ.',
                'Room is not available for the selected dates': 'Phòng không khả dụng cho các ngày đã chọn. Vui lòng thử chọn ngày khác hoặc liên hệ khách sạn để được hỗ trợ.',
                'INSUFFICIENT_ROOM_QUANTITY': 'Số lượng phòng không đủ cho các ngày đã chọn. Vui lòng chọn số lượng phòng ít hơn hoặc chọn ngày khác.',
                'CHECK_IN_DATE_INVALID': 'Ngày nhận phòng không hợp lệ. Vui lòng chọn ngày từ hôm nay trở đi.',
                'CHECK_OUT_DATE_INVALID': 'Ngày trả phòng không hợp lệ. Ngày trả phòng phải sau ngày nhận phòng.',
            };

            // Kiểm tra xem error message có trong map không
            if (errorMessageMap[errorMessage]) {
                errorMessage = errorMessageMap[errorMessage];
            } else if (errorMessage.includes('not available') || errorMessage.includes('NOT_AVAILABLE')) {
                // Nếu message chứa "not available" nhưng không có trong map
                errorMessage = 'Phòng không khả dụng cho các ngày đã chọn. Vui lòng thử chọn ngày khác hoặc liên hệ khách sạn để được hỗ trợ.';
            }

            throw new Error(errorMessage);
        }
    }

    async getBookings(params: { 'user-id'?: string; 'status'?: string; page?: number; size?: number; 'sort-by'?: string, 'sort-dir'?: string }): Promise<PagedResponse<BookingResponse>> {
        try {
            const response = await this.api.get<ApiResponse<PagedResponse<BookingResponse>>>('/bookings', { params });
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Không thể tải danh sách đặt phòng.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Lỗi khi tải lịch sử đặt phòng.');
        }
    }

    async getBookingById(bookingId: string): Promise<any> {
        try {
            const response = await this.api.get<ApiResponse<any>>(`/bookings/${bookingId}`);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Không tìm thấy đơn hàng.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể tìm thông tin đơn hàng.');
        }
    }

    async cancelBooking(bookingId: string): Promise<BookingResponse> {
        try {
            const response = await this.api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/cancel`);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Phản hồi hủy phòng không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể hủy phòng. Vui lòng thử lại.');
        }
    }

    async rescheduleBooking(bookingId: string, payload: RescheduleBookingPayload): Promise<RescheduleBookingResponse> {
        try {
            const response = await this.api.post<ApiResponse<RescheduleBookingResponse>>(`/bookings/${bookingId}/reschedule`, payload);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Phản hồi đổi lịch không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể đổi lịch. Vui lòng thử lại.');
        }
    }

    async checkInBooking(bookingId: string): Promise<BookingResponse> {
        try {
            const response = await this.api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/check-in`);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Phản hồi check-in không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể check-in. Vui lòng thử lại.');
        }
    }

    async checkOutBooking(bookingId: string): Promise<BookingResponse> {
        try {
            const response = await this.api.post<ApiResponse<BookingResponse>>(`/bookings/${bookingId}/check-out`);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Phản hồi check-out không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể check-out. Vui lòng thử lại.');
        }
    }

    async getPaymentUrl(bookingId: string): Promise<{ paymentUrl: string }> {
        try {
            // Gọi API để lấy paymentUrl cho booking
            const response = await this.api.get<ApiResponse<{ paymentUrl: string }>>(`/bookings/${bookingId}/payment-url`);
            if (response.data && response.data.data && response.data.data.paymentUrl) {
                return response.data.data;
            }
            throw new Error("Không thể lấy URL thanh toán.");
        } catch (error: any) {
            // Nếu API không tồn tại (404), throw error với status code để frontend xử lý
            if (error.response?.status === 404) {
                const notFoundError: any = new Error('API payment-url chưa tồn tại');
                notFoundError.response = { status: 404 };
                throw notFoundError;
            }
            throw new Error(error.response?.data?.message || 'Không thể lấy URL thanh toán. Vui lòng thử lại.');
        }
    }
}

export const bookingService = new BookingService();