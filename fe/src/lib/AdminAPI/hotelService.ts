// src/lib/api/hotelService.ts
import type { Hotel } from "@/types";

// DỮ LIỆU GIẢ - THAY THẾ BẰNG API THẬT CỦA BẠN
const MOCK_HOTELS: Hotel[] = [
    { id: '1', name: 'Khách sạn Grand Saigon', address: '123 Đồng Khởi, Q.1, TP.HCM', status: 'ACTIVE' },
    { id: '2', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE' },
    { id: '3', name: 'Resort Biển Đà Nẵng', address: 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', status: 'PENDING' },
    { id: '4', name: 'Khách sạn bị ẩn', address: '456 Lê Lợi, Q.1, TP.HCM', status: 'HIDDEN' },
];

// Hàm lấy danh sách khách sạn
export const getHotels = async (): Promise<Hotel[]> => {
    console.log("Fetching all hotels...");
    // Trong thực tế: const res = await fetch('/api/hotels'); return res.json();
    return new Promise(resolve => setTimeout(() => resolve(MOCK_HOTELS), 500));
};

// Hàm lấy một khách sạn theo ID
export const getHotelById = async (id: string): Promise<Hotel | null> => {
    console.log(`Fetching hotel with id: ${id}`);
    const hotel = MOCK_HOTELS.find(h => h.id === id);
    return new Promise(resolve => setTimeout(() => resolve(hotel || null), 300));
};

// Hàm tạo khách sạn mới
export const createHotel = async (data: Omit<Hotel, 'id'>): Promise<Hotel> => {
    console.log("Creating new hotel:", data);
    // Trong thực tế: const res = await fetch('/api/hotels', { method: 'POST', body: JSON.stringify(data) });
    const newHotel: Hotel = { id: String(Date.now()), ...data };
    MOCK_HOTELS.push(newHotel);
    return new Promise(resolve => setTimeout(() => resolve(newHotel), 500));
};

// Hàm cập nhật khách sạn
export const updateHotel = async (id: string, data: Partial<Hotel>): Promise<Hotel | null> => {
    console.log(`Updating hotel ${id} with:`, data);
    // Trong thực tế: const res = await fetch(`/api/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    const hotelIndex = MOCK_HOTELS.findIndex(h => h.id === id);
    if (hotelIndex === -1) return null;
    MOCK_HOTELS[hotelIndex] = { ...MOCK_HOTELS[hotelIndex], ...data };
    return new Promise(resolve => setTimeout(() => resolve(MOCK_HOTELS[hotelIndex]), 500));
};