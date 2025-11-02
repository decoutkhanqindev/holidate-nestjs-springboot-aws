"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { PageHeader } from "@/components/Admin/ui/PageHeader";
import { Hotel, Room } from "@/types";
import { getHotels } from "@/lib/AdminAPI/hotelService";
import { getRoomsByHotelId } from "@/lib/AdminAPI/roomService"; // Import hàm mới
import RoomsTable from "@/components/Admin/rooms/RoomTable"; // Import table mới

export default function ManageRoomsPage() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [selectedHotel, setSelectedHotel] = useState<string>('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            const hotelsData = await getHotels();
            setHotels(hotelsData);
            if (hotelsData.length > 0) {
                setSelectedHotel(hotelsData[0].id);
            } else {
                setIsLoading(false);
            }
        };
        fetchHotels();
    }, []);

    useEffect(() => {
        if (!selectedHotel) return;

        const fetchRooms = async () => {
            setIsLoading(true);
            const roomsData = await getRoomsByHotelId(selectedHotel);
            setRooms(roomsData);
            setIsLoading(false);
        };
        fetchRooms();
    }, [selectedHotel]);

    return (
        <>
            <PageHeader title="Quản lý Phòng">
                <Link
                    href={selectedHotel ? `/admin-rooms/new?hotelId=${selectedHotel}` : '#'}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold shadow-sm ${selectedHotel ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    Thêm phòng mới
                </Link>
            </PageHeader>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">
                    <label htmlFor="hotel-select" className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn khách sạn để quản lý phòng:
                    </label>
                    <select
                        id="hotel-select"
                        value={selectedHotel}
                        onChange={(e) => setSelectedHotel(e.target.value)}
                        className="block w-full max-w-sm pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        {hotels.map(hotel => (
                            <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                        ))}
                    </select>
                </div>

                {isLoading ? <p>Đang tải danh sách phòng...</p> : <RoomsTable rooms={rooms} hotelId={selectedHotel} />}
            </div>
        </>
    );
}