// File: src/components/Admin/HotelsTable.tsx

"use client";

import Link from 'next/link';
import { useTransition } from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
// Hãy chắc chắn rằng bạn có định nghĩa type này
import type { Hotel, HotelStatus } from '@/types';
import { deleteHotelAction } from '@/lib/actions/hotelActions';

// Component StatusBadge không đổi
function StatusBadge({ status }: { status: HotelStatus }) {
    const statusStyles: Record<HotelStatus, string> = {
        ACTIVE: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        HIDDEN: "bg-gray-100 text-gray-800",
    };
    const statusText: Record<HotelStatus, string> = {
        ACTIVE: "ACTIVE",
        PENDING: "PENDING",
        HIDDEN: "HIDDEN",
    };
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
}

interface HotelsTableProps {
    hotels: Hotel[];
}

export default function HotelsTable({ hotels }: HotelsTableProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?`)) {
            startTransition(async () => {
                await deleteHotelAction(id);
            });
        }
    };

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TÊN KHÁCH SẠN
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ĐỊA CHỈ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TRẠNG THÁI
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                HÀNH ĐỘNG
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={hotel.address}>
                                    {hotel.address}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={hotel.status} />
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-x-2">
                                        <Link
                                            href={`/admin-hotels/${hotel.id}`}
                                            className="px-3 py-1.5 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                                            title="Xem chi tiết"
                                        >
                                            <EyeIcon className="h-4 w-4" />
                                            <span>Xem</span>
                                        </Link>
                                        <Link
                                            href={`/admin-hotels/${hotel.id}/edit`}
                                            className="px-3 py-1.5 bg-gray-100 text-blue-600 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            <span>Sửa</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(hotel.id, hotel.name)}
                                            disabled={isPending}
                                            className="px-3 py-1.5 bg-gray-100 text-red-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100 rounded-md transition-colors text-sm font-medium flex items-center gap-1.5"
                                            title="Xóa"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}