// app/admin-bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import BookingsTable from '@/components/Admin/booking/BookingsTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon } from '@heroicons/react/24/solid';
import type { Booking } from '@/types';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 5;

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        async function loadBookings() {
            setIsLoading(true);
            const response = await getBookings({ page: currentPage, limit: ITEMS_PER_PAGE });
            setBookings(response.data);
            setTotalPages(response.totalPages);
            setIsLoading(false);
        }
        loadBookings();
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Đặt phòng</span>}>
                <button
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm Đặt Phòng
                </button>
            </PageHeader>

            {isLoading ? (
                <p>Đang tải dữ liệu đặt phòng...</p>
            ) : (
                <>
                    <BookingsTable bookings={bookings} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}