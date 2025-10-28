// lib/AdminAPI/roomService.ts
import type { Room } from "@/types";

let MOCK_ROOMS: Room[] = [
    { id: 'r001', hotelId: 'h001', name: 'Phòng 101', image: '/rooms/room1.jpg', type: 'Standard', price: 500000, status: 'AVAILABLE' },
    { id: 'r002', hotelId: 'h001', name: 'Phòng 102 Deluxe', image: '/rooms/room2.jpg', type: 'Deluxe', price: 800000, status: 'OCCUPIED' },
    { id: 'r003', hotelId: 'h002', name: 'P.Hanoi View', image: '/rooms/room3.jpg', type: 'Suite', price: 1200000, status: 'MAINTENANCE' },
    { id: 'r004', hotelId: 'h001', name: 'Phòng 201', image: '/rooms/room4.jpg', type: 'Standard', price: 550000, status: 'AVAILABLE' },
    { id: 'r005', hotelId: 'h002', name: 'P.City Balcony', image: '/rooms/room5.jpg', type: 'Deluxe', price: 900000, status: 'AVAILABLE' },
];

export const getRoomsByHotelId = async (hotelId: string): Promise<Room[]> => {
    console.log(`[Mock API] Fetching rooms for hotelId: ${hotelId}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Giả lập độ trễ mạng
    return MOCK_ROOMS.filter(r => r.hotelId === hotelId);
};

export const getRoomById = async (roomId: string): Promise<Room | undefined> => {
    console.log(`[Mock API] Fetching room with id: ${roomId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_ROOMS.find(r => r.id === roomId);
};



export const createRoom = async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    console.log('[Mock API] Creating new room:', roomData);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Tạo ID mới ngẫu nhiên
    const newId = `r${Math.random().toString(36).substr(2, 9)}`;
    const newRoom: Room = {
        id: newId,
        ...roomData,
    };

    // Thêm phòng mới vào đầu mảng
    MOCK_ROOMS.unshift(newRoom);

    return newRoom;
};

/**
 * Hàm cập nhật thông tin phòng
 * @param roomId ID của phòng cần cập nhật
 * @param updatedData Dữ liệu mới để cập nhật
 */
export const updateRoom = async (roomId: string, updatedData: Partial<Omit<Room, 'id'>>): Promise<Room | undefined> => {
    console.log(`[Mock API] Updating room ${roomId} with:`, updatedData);
    await new Promise(resolve => setTimeout(resolve, 500));

    const roomIndex = MOCK_ROOMS.findIndex(r => r.id === roomId);

    if (roomIndex === -1) {
        // Không tìm thấy phòng
        return undefined;
    }

    // Cập nhật dữ liệu
    const originalRoom = MOCK_ROOMS[roomIndex];
    const updatedRoom = { ...originalRoom, ...updatedData };
    MOCK_ROOMS[roomIndex] = updatedRoom;

    return updatedRoom;
};

/**
 * Hàm xóa phòng
 * @param roomId ID của phòng cần xóa
 */
export const deleteRoom = async (roomId: string): Promise<{ success: boolean }> => {
    console.log(`[Mock API] Deleting room with id: ${roomId}`);
    await new Promise(resolve => setTimeout(resolve, 500));

    const initialLength = MOCK_ROOMS.length;
    // Lọc ra mảng mới không chứa phòng có ID cần xóa
    MOCK_ROOMS = MOCK_ROOMS.filter(r => r.id !== roomId);

    // Kiểm tra xem việc xóa có thành công không
    const success = MOCK_ROOMS.length < initialLength;

    return { success };
};