// File: src/components/Admin/HotelsTable.tsx

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
        ACTIVE: "Đang hoạt động",
        PENDING: "Chờ duyệt",
        HIDDEN: "Đã ẩn",
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
                                Ảnh
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên khách sạn
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Địa chỉ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center">
                                        <Image
                                            className="h-full w-full rounded-md object-cover"
                                            src={hotel.imageUrl || '/placeholder.png'}
                                            alt={hotel.name}
                                            width={96}
                                            height={64}
                                        />
                                    </div>
                                </td>

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
                                    <div className="flex items-center justify-end gap-x-5">
                                        <Link href={`/admin-hotels/${hotel.id}`} className="text-indigo-600 hover:text-indigo-800" title="Chỉnh sửa">
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                        <button onClick={() => handleDelete(hotel.id, hotel.name)} disabled={isPending} className="text-red-600 hover:text-red-800 disabled:text-gray-400" title="Xóa">
                                            <TrashIcon className="h-5 w-5" />
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