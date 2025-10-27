import type { Room } from "@/types";

let MOCK_ROOMS: Room[] = [
    { id: 'r001', hotelId: '1', name: 'Phòng 101', image: '.', type: 'Standard', price: 500000, status: 'AVAILABLE' },
    { id: 'r002', hotelId: '1', name: 'Phòng 102', image: '.', type: 'Deluxe', price: 800000, status: 'OCCUPIED' },
    { id: 'r003', hotelId: '2', name: 'P.Hanoi View', image: '.', type: 'Suite', price: 1200000, status: 'MAINTENANCE' },
];

export const getRoomsByHotelId = async (hotelId: string): Promise<Room[]> => {
    return MOCK_ROOMS.filter(r => r.hotelId === hotelId);
}
// ... các hàm create, update, delete cho phòng