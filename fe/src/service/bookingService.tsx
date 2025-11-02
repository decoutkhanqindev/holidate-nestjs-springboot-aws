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
    priceDetails: {
        finalPrice: number;
    };
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
            const response = await this.api.post<ApiResponse<CreateBookingResponse>>('/bookings', payload);
            if (response.data?.data?.paymentUrl) { return response.data.data; }
            throw new Error("Phản hồi không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể tạo yêu cầu đặt phòng.');
        }
    }

    async getBookingPricePreview(payload: BookingPricePreviewPayload): Promise<BookingPriceDetailsResponse> {
        try {
            console.log("debug payload", payload);
            const response = await this.api.post<ApiResponse<BookingPriceDetailsResponse>>('/bookings/price-preview', payload);
            if (response.data && response.data.data) { return response.data.data; }
            throw new Error("Cấu trúc phản hồi không hợp lệ.");
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Không thể xem trước giá phòng.');
        }
    }

    async getBookings(params: { 'user-id'?: string; page?: number; size?: number; 'sort-by'?: string, 'sort-dir'?: string }): Promise<PagedResponse<BookingResponse>> {
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
}

export const bookingService = new BookingService();