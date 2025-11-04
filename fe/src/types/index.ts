// src/types/index.ts

export type HotelStatus = 'PENDING' | 'ACTIVE' | 'HIDDEN';

export interface Hotel {
    id: string;
    name: string;
    address: string;
    status: HotelStatus;
    ownerId?: string;
    imageUrl?: string;
    stt?: number;
    description?: string;

}
// types/index.ts


export type DiscountType = 'PERCENT' | 'AMOUNT';

export interface Discount {
    id: string;
    code: string;
    description?: string;
    discountValue: number;
    discountType: DiscountType; // 'PERCENT' cho % hoặc 'AMOUNT' cho VND
    expiresAt: Date;
    active?: boolean; // Trạng thái hoạt động
    createdAt: Date;
}
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
    id: string;
    hotelId: string;
    name: string;
    type: string;
    price: number;
    status: RoomStatus;
    image: string;
    images?: string[]; // Nhiều ảnh
    quantity?: number; // Tổng số lượng phòng (totalRooms)
    availableQuantity?: number; // Số lượng phòng khả dụng (availableRooms)
    amenities?: Array<{ id: string; name: string }>; // Tiện ích phòng (đã flatten từ nested structure)
}


// ... các type khác

export type UserRole = 'SUPER_ADMIN' | 'HOTEL_ADMIN' | 'HOTEL_STAFF' | 'CUSTOMER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
    role: UserRole;
    status: UserStatus;
}


export type PaymentStatus = 'PAID' | 'UNPAID' | 'PENDING' | 'REFUNDED';
export type BookingStatus = 'COMPLETED' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'CHECKED_IN';

export interface Booking {
    id: string; // UUID từ backend (không phải number)
    customerName: string;
    roomNumbers: string[];
    checkInDate: Date;
    checkOutDate: Date;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    // Thêm các field mới
    email: string;
    phone: string;
    numberOfAdults: number;
    numberOfChildren: number;
}


/// type dành cho super admin


export interface HotelAdmin {
    id: number;
    username: string;
    email: string;
    managedHotel: {
        id: string;
        name: string;
    };
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
}