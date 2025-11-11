// File: src/components/Admin/HotelsTable.tsx

"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EyeIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Hotel, HotelStatus } from '@/types';
import { deleteHotelAction } from '@/lib/actions/hotelActions';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';

// Component StatusBadge với text tiếng Việt
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
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

// Component Pagination
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="flex items-center justify-between mt-6 px-6 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
            </div>
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>

                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                </span>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
            </nav>
        </div>
    );
}

export default function HotelsTable({ hotels, currentPage, totalPages, totalItems }: HotelsTableProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { effectiveUser } = useAuth();

    // Chỉ admin mới có quyền edit/delete, partner chỉ xem
    const isAdmin = effectiveUser?.role.name.toLowerCase() === 'admin';
    const showActions = isAdmin; // Chỉ hiển thị cột hành động nếu là admin

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Bạn có chắc chắn muốn xóa khách sạn "${name}" không?`)) {
            startTransition(async () => {
                await deleteHotelAction(id);
                router.refresh();
            });
        }
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.push(`/admin-hotels?${params.toString()}`);
    };

    // Tính STT dựa trên currentPage (1-based)
    const startIndex = (currentPage - 1) * 10;

    return (
        <div className={`mt-6 bg-white rounded-lg shadow-md overflow-hidden transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STT
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TÊN KHÁCH SẠN
                            </th>
                            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ĐỊA CHỈ
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ẢNH
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TRẠNG THÁI
                            </th>
                            {showActions && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    HÀNH ĐỘNG
                                </th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {hotels.length === 0 ? (
                            <tr>
                                <td colSpan={showActions ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500">
                                    Không có khách sạn nào
                                </td>
                            </tr>
                        ) : (
                            hotels.map((hotel, index) => (
                                <tr key={hotel.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{startIndex + index + 1}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                                    </td>

                                    <td className="px-2 py-4 text-sm text-gray-600 max-w-md" title={hotel.address}>
                                        <div className="break-words whitespace-normal">{hotel.address}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {hotel.imageUrl ? (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center overflow-hidden rounded-md">
                                                <Image
                                                    className="h-full w-full object-cover"
                                                    src={hotel.imageUrl}
                                                    alt={hotel.name}
                                                    width={96}
                                                    height={64}
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-shrink-0 h-16 w-24 flex items-center justify-center bg-gray-100 rounded-md">
                                                <span className="text-xs text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {hotel.status ? (
                                            <StatusBadge status={hotel.status} />
                                        ) : (
                                            <StatusBadge status="ACTIVE" />
                                        )}
                                    </td>

                                    {showActions && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center justify-end gap-x-2">
                                                <Link
                                                    href={`/admin-hotels/${hotel.id}`}
                                                    className="p-2 bg-gray-100 text-green-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </Link>
                                                <Link
                                                    href={`/admin-hotels/${hotel.id}/edit`}
                                                    className="p-2 bg-gray-100 text-blue-600 hover:bg-gray-200 rounded-md transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(hotel.id, hotel.name)}
                                                    disabled={isPending}
                                                    className="p-2 bg-gray-100 text-red-600 hover:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-100 rounded-md transition-colors"
                                                    title="Xóa"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}