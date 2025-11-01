import apiClient, { ApiResponse } from './apiClient';

// === INTERFACES CHO BOOKING ===
export interface CreateBookingPayload {
    userId: string;
    roomId: string;
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfRooms: number;
    numberOfAdults: number;
    numberOfChildren: number;
    contactFullName: string;
    contactEmail: string;
    contactPhone: string;
    discountCode?: string;
}

export interface CreateBookingResponse {
    id: string;
    paymentUrl: string;
    status: string;
}

// === INTERFACES CHO XEM TRƯỚC GIÁ ===
export interface BookingPricePreviewPayload {
    roomId: string;
    startDate: string;
    endDate: string;
    numberOfRooms: number;
    numberOfAdults: number;
    numberOfChildren: number;
    discountCode?: string;
}

export interface BookingPriceDetailsResponse {
    originalPrice: number;
    discountAmount: number;
    netPriceAfterDiscount: number;
    tax: { name: string; percentage: number; amount: number };
    serviceFee: { name: string; percentage: number; amount: number };
    finalPrice: number;
    appliedDiscount: { code: string; } | null;
}

class BookingService {
    private api = apiClient;

    // API TẠO BOOKING (1.1)
    async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
        try {
            const response = await this.api.post<ApiResponse<CreateBookingResponse>>('/bookings', payload);
            if (response.data?.data?.paymentUrl) {
                return response.data.data;
            }
            throw new Error("Phản hồi từ server không hợp lệ hoặc không chứa URL thanh toán.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể tạo yêu cầu đặt phòng. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }

    // API XEM TRƯỚC GIÁ (1.2) - ĐÃ SỬA LỖI
    async getBookingPricePreview(payload: BookingPricePreviewPayload): Promise<BookingPriceDetailsResponse> {
        try {
            console.log("🕵️ [DEBUG] Payload gửi đến API price-preview:", JSON.stringify(payload, null, 2));
            const response = await this.api.request<ApiResponse<BookingPriceDetailsResponse>>({
                method: 'GET',
                url: '/bookings/price-preview',
                data: payload // 'data' chính là Request Body
            });

            if (response.data && response.data.data) {
                return response.data.data;
            }
            throw new Error("Cấu trúc phản hồi xem trước giá không hợp lệ.");
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Không thể xem trước giá phòng.';
            throw new Error(errorMessage);
        }
    }

    // API LẤY CHI TIẾT BOOKING (1.3)
    async getBookingById(bookingId: string): Promise<any> {
        try {
            const response = await this.api.get<ApiResponse<any>>(`/bookings/${bookingId}`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            throw new Error("Không tìm thấy dữ liệu cho đơn hàng này.");
        } catch (error: any) {
            console.error(`Lỗi khi lấy booking theo ID ${bookingId}:`, error);
            throw new Error('Không thể tìm thấy thông tin đơn hàng.');
        }
    }
}

export const bookingService = new BookingService();