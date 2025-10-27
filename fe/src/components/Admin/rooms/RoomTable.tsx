"use client";

import type { Room } from "@/types";
import Link from 'next/link';
// Import các icon nếu cần

export default function RoomsTable({ rooms, hotelId }: { rooms: Room[], hotelId: string }) {
    if (rooms.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Khách sạn này chưa có phòng nào. <Link href={`/admin-rooms/new?hotelId=${hotelId}`} className="text-blue-600 font-semibold">Thêm phòng ngay</Link>.</p>;
    }

    return (
        <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">STT</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tên/Số phòng</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Loại phòng</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hình ảnh </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Giá / đêm</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase"><span style={{}}>Hành động</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200  text-center">
                    {rooms.map((room, index) => (
                        <tr key={room.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{room.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.image ? <img src={room.image} alt={room.name} className="h-12 w-12 object-cover rounded-md" /> : 'Chưa có hình ảnh'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.price.toLocaleString('vi-VN')} VNĐ</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{room.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                <Link href={`/admin-rooms/${room.id}`} className="text-indigo-600 hover:text-indigo-900">Sửa</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}