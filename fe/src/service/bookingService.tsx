// export interface BookingPaymentData {
//     hotelId: string;
//     roomId: string;
//     roomName: string;
//     price: number;
//     checkInDate: string;
//     checkin: string;
//     checkout: string;
//     nights: number;
//     guests: number;
//     quantity: number;
//     includesBreakfast: boolean;
//     contactInfo: {
//         fullName: string;
//         email: string;
//         phone: string;
//     };
//     specialRequests?: string[];
//     paymentMethod: 'payNow' | 'payAtHotel';
//     totalPrice: number;
//     totalAndFee: number;
//     numberOfNights: number;
//     numberOfRooms: number;


// }
// export interface BookingResponse {
//     bookingId: string;
//     status: string;
//     message: string;
// }
// export const bookingService = {
//     async createBooking(data: BookingPaymentData): Promise<BookingResponse> {
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(data),
//         });

//         if (!response.ok) {
//             throw new Error('Không thể tạo đơn đặt phòng');
//         }

//         return response.json();
//     },
// };

// src/service/bookingService.ts

import apiClient, { ApiResponse } from './apiClient';

// ===================================================================
// === ĐỊNH NGHĨA CÁC INTERFACE (CẤU TRÚC DỮ LIỆU) ===
// ===================================================================

export interface CreateBookingPayload {
    roomId: string;
    checkInDate: string;
    numberOfNights: number;
    numberOfGuests: number;
    customerInfo: {
        fullName: string;
        email: string;
        phone: string;
    };
    specialRequests: string[];
    paymentMethod: string;
}

export interface CreateBookingResponse {
    bookingId: string;
    paymentUrl: string;
    message?: string;
}

// ===================================================================
// === TẠO CLASS BOOKING SERVICE ===
// ===================================================================

class BookingService {
    private api = apiClient;

    async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
        console.log('[BookingService] Bắt đầu gửi yêu cầu tạo booking...');
        console.log('[BookingService] Payload gửi đi:', payload);

        try {
            const endpoint = '/accommodation/bookings/create'; // Endpoint cần xác nhận với backend

            const response = await this.api.post<ApiResponse<CreateBookingResponse>>(endpoint, payload);

            console.log('[BookingService] Nhận được phản hồi thành công từ backend:', response.data);

            if (response.data && response.data.data) {
                return response.data.data;
            }

            throw new Error("Cấu trúc phản hồi từ server không hợp lệ.");

        } catch (error: any) {
            console.error('[BookingService] Gặp lỗi khi gọi API tạo booking:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || 'Không thể tạo yêu cầu đặt phòng. Vui lòng thử lại.';
            throw new Error(errorMessage);
        }
    }
}

export const bookingService = new BookingService();