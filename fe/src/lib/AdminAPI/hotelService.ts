// src/lib/api/hotelService.ts
import type { Hotel } from "@/types"; // Giả sử bạn có file types/index.ts định nghĩa Hotel

// DỮ LIỆU GIẢ - THAY THẾ BẰNG API THẬT CỦA BẠN
let MOCK_HOTELS: Hotel[] = [

    { id: '1', name: 'Khách sạn Grand Saigon', address: '123 Đồng Khởi, Q.1, TP.HCM', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h001/200/200' },
    { id: '2', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h002/200/200' },

    { id: '3', name: 'Resort Biển Đà Nẵng', address: 'Võ Nguyên Giáp, Sơn Trà, Đà Nẵng', status: 'PENDING', imageUrl: 'https://picsum.photos/seed/h003/200/200' },
    { id: '4', name: 'Khách sạn bị ẩn', address: '456 Lê Lợi, Q.1, TP.HCM', status: 'HIDDEN', imageUrl: 'https://picsum.photos/seed/h004/200/200' },
    { id: '5', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h002/200/200' },
    { id: '6', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h002/200/200' },
    { id: '7', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h002/200/200' },
    { id: '8', name: 'Hanoi Pearl Hotel', address: 'Số 6, Bà Triệu, Hoàn Kiếm, Hà Nội', status: 'ACTIVE', imageUrl: 'https://picsum.photos/seed/h002/200/200' },

];

// Hàm lấy danh sách khách sạn
export const getHotels = async (): Promise<Hotel[]> => {
    console.log("Fetching all hotels...");
    return new Promise(resolve => setTimeout(() => resolve(MOCK_HOTELS), 500));
};

// Hàm lấy một khách sạn theo ID
export const getHotelById = async (id: string): Promise<Hotel | null> => {
    console.log(`Fetching hotel with id: ${id}`);
    const hotel = MOCK_HOTELS.find(h => h.id === id);
    return new Promise(resolve => setTimeout(() => resolve(hotel || null), 300));
};

// Hàm tạo khách sạn mới
export const createHotel = async (data: Omit<Hotel, 'id' | 'imageUrl'>): Promise<Hotel> => {
    console.log("Creating new hotel:", data);
    const newHotel: Hotel = {
        id: String(Date.now()),
        ...data,
        imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`
    };
    MOCK_HOTELS.push(newHotel);
    return new Promise(resolve => setTimeout(() => resolve(newHotel), 500));
};

// Hàm cập nhật khách sạn
export const updateHotel = async (id: string, data: Partial<Omit<Hotel, 'id'>>): Promise<Hotel | null> => {
    console.log(`Updating hotel ${id} with:`, data);
    const hotelIndex = MOCK_HOTELS.findIndex(h => h.id === id);
    if (hotelIndex === -1) return null;
    MOCK_HOTELS[hotelIndex] = { ...MOCK_HOTELS[hotelIndex], ...data };
    return new Promise(resolve => setTimeout(() => resolve(MOCK_HOTELS[hotelIndex]), 500));
};

// *** HÀM MỚI ***
// Hàm xóa khách sạn
export const deleteHotel = async (id: string): Promise<{ success: boolean }> => {
    console.log(`Deleting hotel with id: ${id}`);
    const initialLength = MOCK_HOTELS.length;
    MOCK_HOTELS = MOCK_HOTELS.filter(h => h.id !== id);
    const success = MOCK_HOTELS.length < initialLength;
    return new Promise(resolve => setTimeout(() => resolve({ success }), 500));
};