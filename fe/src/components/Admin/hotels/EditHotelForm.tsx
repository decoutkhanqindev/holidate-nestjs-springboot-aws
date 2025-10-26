"use client";

import Image from 'next/image';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Hotel, HotelStatus } from '@/types';

// Helper component để hiển thị badge trạng thái
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
    }
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
}

// Props cho component HotelsTable
interface HotelsTableProps {
    hotels: Hotel[];
}

export default function HotelsTable({ hotels }: HotelsTableProps) {

    // --- LOGIC MẪU ĐỂ XỬ LÝ HÀNH ĐỘNG ---
    // Trong thực tế, bạn sẽ gọi Server Actions ở đây
    const handleEdit = (id: string, name: string) => {
        // Tạm thời chỉ alert, Link đã lo việc điều hướng
        alert(`Bạn đang chuẩn bị sửa khách sạn: "${name}" (ID: ${id})`);
    };

    const handleDelete = (id: string, name: string) => {
        // Đây là nơi sẽ gọi action xóa
        // Vì đây là UI base, chúng ta chỉ hiển thị confirm dialog
        if (confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?\n(Hành động này chưa thực sự xóa dữ liệu)`)) {
            alert(`Đã gửi yêu cầu xóa khách sạn "${name}"!`);
            // Sau này bạn sẽ gọi Server Action tại đây, ví dụ: startTransition(() => deleteHotelAction(id));
        }
    };

    return (
        <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tên khách sạn
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Địa chỉ
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th scope="col" className="relative px-6 py-4">
                                <span className="sr-only">Hành động</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.map((hotel) => (
                            <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <Image
                                                className="h-12 w-12 rounded-md object-cover"
                                                src={hotel.imageUrl || '/placeholder.png'} // Dùng ảnh placeholder nếu không có
                                                alt={hotel.name}
                                                width={48}
                                                height={48}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={hotel.address}>
                                    {hotel.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={hotel.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-x-5">
                                        {/* NÚT SỬA */}
                                        <Link
                                            href={`/hotels/edit-placeholder/${hotel.id}`} // Link tới một trang sửa giả lập
                                            onClick={() => handleEdit(hotel.id, hotel.name)}
                                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>

                                        {/* NÚT XÓA */}
                                        <button
                                            onClick={() => handleDelete(hotel.id, hotel.name)}
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Xóa"
                                        >
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