// src/types/index.ts

export type HotelStatus = 'PENDING' | 'ACTIVE' | 'HIDDEN';

export interface Hotel {
    id: string;
    name: string;
    address: string;
    status: HotelStatus;
    ownerId?: string; // Tùy chọn
}

// Bạn có thể thêm các type khác ở đây
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'HOTEL_MANAGER' | 'USER';
}

export interface Booking {
    id: string;
    hotelId: string;
    userId: string;
    checkInDate: Date;
    checkOutDate: Date;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}