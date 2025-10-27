"use client";
import Link from 'next/link';
import { Hotel } from '@/types';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';

function StatusBadge({ status }: { status: Hotel['status'] }) {
    const styles = {
        ACTIVE: 'bg-green-100 text-green-800',
        PENDING: 'bg-yellow-100 text-yellow-800',
        HIDDEN: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
}
export default function HotelsTable({ hotels }: { hotels: Hotel[] }) {
    const { startImpersonation } = useAuth();

    const handleDelete = (id: string) => {
        alert(`Xóa khách sạn id: ${id}`);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-3 px-6 text-left text-sm font-bold text-blue-700 uppercase">Tên khách sạn</th>
                        <th className="py-3 px-6 text-left text-sm font-bold text-blue-700 uppercase">Địa chỉ</th>
                        <th className="py-3 px-6 text-left text-sm font-bold text-blue-700 uppercase">Trạng thái</th>
                        <th className="py-3 px-6 text-center text-sm font-bold text-blue-700 uppercase">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {hotels.map((hotel) => (
                        <tr key={hotel.id}>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-900 font-semibold text-base">{hotel.name}</td>
                            <td className="py-4 px-6 whitespace-nowrap text-gray-900 text-base">{hotel.address}</td>
                            <td className="py-4 px-6 whitespace-nowrap">
                                <StatusBadge status={hotel.status} />
                            </td>
                            <td className="py-4 px-6 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center gap-2">
                                    {/* NÚT XEM NHANH MỚI */}
                                    <button
                                        type="button"
                                        className="text-green-600 font-bold hover:text-white hover:bg-green-600 px-2 py-1 rounded border border-green-500 transition"
                                        onClick={() => startImpersonation({ id: hotel.id, name: hotel.name })}
                                    >
                                        Xem
                                    </button>
                                    <Link
                                        href={`/admin-hotels/${hotel.id}`} // << Đảm bảo nó chính xác là thế này
                                        className="text-blue-600 font-bold hover:text-pink-500 underline px-2 py-1 rounded transition"
                                    >
                                        Sửa
                                    </Link>
                                    <button
                                        type="button"
                                        className="text-red-600 font-bold hover:text-white hover:bg-red-600 px-2 py-1 rounded border border-red-500 transition"
                                        onClick={() => handleDelete(hotel.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}