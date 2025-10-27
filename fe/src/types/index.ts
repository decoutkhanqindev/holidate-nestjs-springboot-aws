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
    discountValue: number;
    discountType: DiscountType; // 'PERCENT' cho % hoặc 'AMOUNT' cho VND
    expiresAt: Date;
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
    id: number;
    customerName: string;
    roomNumbers: string[]; // Mảng chứa các số phòng, ví dụ ['03', '04']
    checkInDate: Date;
    checkOutDate: Date;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
}
