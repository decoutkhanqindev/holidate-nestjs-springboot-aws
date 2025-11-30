"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import HotelsTable from '@/components/Admin/hotels/HotelsTable';
import AddHotelButton from '@/components/Admin/hotels/AddHotelButton';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import type { Hotel } from '@/types';

// Component PageHeader để code gọn hơn
function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export default function HotelsPage() {
    const { effectiveUser, isLoading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    // Lấy page từ query params
    useEffect(() => {
        const pageParam = searchParams.get('page');
        const page = pageParam ? parseInt(pageParam, 10) - 1 : 0;
        setCurrentPage(Math.max(0, page));
    }, [searchParams]);

    // Load hotels với filter theo user hiện tại
    useEffect(() => {
        const loadHotels = async () => {
            // Đợi auth loading xong
            if (authLoading) {
                return;
            }

            // Kiểm tra user
            if (!effectiveUser) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // Lấy userId và roleName từ user hiện tại
                const userId = effectiveUser.id?.toString();
                const roleName = effectiveUser.role?.name;


                const size = 10; // 10 khách sạn mỗi trang

                // Gọi API với filter theo userId nếu role là PARTNER
                // getHotels sẽ tự động filter theo partner-id nếu userId và roleName được truyền
                const paginatedData = await getHotels(
                    currentPage,
                    size,
                    undefined, // cityId
                    undefined, // provinceId
                    userId, // userId để filter theo owner
                    roleName // roleName để xác định có cần filter không
                );

                console.log('[HotelsPage] Loaded hotels:', {
                    count: paginatedData.hotels.length,
                    totalItems: paginatedData.totalItems,
                    currentPage: paginatedData.page + 1,
                    totalPages: paginatedData.totalPages
                });

                setHotels(paginatedData.hotels);
                setTotalPages(paginatedData.totalPages);
                setTotalItems(paginatedData.totalItems);
            } catch (error: any) {
                setHotels([]);
                setTotalPages(0);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadHotels();
    }, [currentPage, effectiveUser, authLoading]);

    // Handler cho pagination
    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1); // Convert từ 1-based sang 0-based
        router.push(`/admin-hotels?page=${page}`);
    };

    // Hiển thị loading
    if (authLoading || isLoading) {
        return (
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Đang tải dữ liệu...</div>
                </div>
            </div>
        );
    }

    // Hiển thị thông báo nếu không có khách sạn
    if (!isLoading && hotels.length === 0) {
        return (
            <div className="p-6 md:p-8">
                <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn</span>}>
                    <AddHotelButton />
                </PageHeader>

                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center">
                        <svg
                            className="mx-auto h-16 w-16 text-gray-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Chưa có khách sạn
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            Tài khoản của bạn hiện chưa có khách sạn nào. Hãy tạo khách sạn đầu tiên để bắt đầu quản lý.
                        </p>
                        <AddHotelButton />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <PageHeader title={<span style={{ color: '#2563eb', fontWeight: 700 }}>Quản lý Khách sạn</span>}>
                <AddHotelButton />
            </PageHeader>

            {/* BẢNG HIỂN THỊ DỮ LIỆU VỚI PHÂN TRANG */}
            <HotelsTable
                hotels={hotels}
                currentPage={currentPage + 1} // Convert từ 0-based sang 1-based
                totalPages={totalPages}
                totalItems={totalItems}
            />
        </div>
    );
}