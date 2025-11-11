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
export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE' | 'CLOSED';

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

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    hotelId: string;
    hotelName: string;
    roomId: string;
    roomName: string;
    bookingId: string;
    score: number; // 1-10
    comment?: string;
    photos?: Array<{ id: string; url: string }>;
    createdAt: Date;
    updatedAt?: Date;
}

// Super Discount type (matching backend DiscountResponse)
export interface SuperDiscount {
    id: string;
    code: string;
    description: string;
    percentage: number; // e.g., 10.0 for 10%
    usageLimit: number;
    timesUsed: number;
    minBookingPrice: number;
    minBookingCount: number;
    validFrom: Date | string;
    validTo: Date | string;
    active: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    hotel?: {
        id: string;
        name: string;
    };
    specialDay?: {
        id: string;
        name: string;
    };
}

// Paged Response type
export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
}

// Payment Transaction type for Super Admin
export type PaymentTransactionStatus = 'PAID' | 'PENDING' | 'EXPIRED' | 'FAILED';

export interface PaymentTransaction {
    id: string;
    adminName: string;
    adminEmail: string;
    hotelName: string;
    hotelId: string;
    paymentDate: Date;
    expiryDate: Date;
    amount: number;
    status: PaymentTransactionStatus;
    paymentMethod: string; // 'VNPay', 'Bank Transfer', etc.
    transactionId: string;
    description?: string;
}

// Support Request type for Super Admin
export type SupportRequestStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportRequestType = 'TECHNICAL' | 'VIOLATION' | 'PAYMENT' | 'INFO_UPDATE' | 'BUG_REPORT' | 'ACCOUNT' | 'OTHER';
export type SupportRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SupportRequest {
    id: string;
    partnerName: string;
    partnerEmail: string;
    phoneNumber: string;
    hotelName: string;
    request: string;
    requestType: SupportRequestType;
    status: SupportRequestStatus;
    priority: SupportRequestPriority;
    createdAt: Date;
    resolvedAt?: Date;
}