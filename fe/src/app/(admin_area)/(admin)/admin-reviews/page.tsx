// app/admin-reviews/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getReviews } from '@/lib/AdminAPI/reviewService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import ReviewsTable from '@/components/Admin/review/ReviewsTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import type { Review } from '@/types';

function PageHeader({ title }: { title: React.ReactNode }) {
    return (
        <div className="mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;

export default function ReviewsPage() {
    const { effectiveUser } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        async function loadReviews() {
            setIsLoading(true);
            try {
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;


                // Nếu role là PARTNER, lấy danh sách hotels của họ trước
                // Sau đó filter reviews theo hotelId của các hotels đó
                let hotelIds: string[] = [];

                if (roleName?.toLowerCase() === 'partner' && userId) {
                    try {
                        const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                        hotelIds = hotelsData.hotels.map(h => h.id);

                        // Nếu PARTNER không có hotels, không có reviews
                        if (hotelIds.length === 0) {
                            setReviews([]);
                            setTotalPages(0);
                            setTotalItems(0);
                            setIsLoading(false);
                            return;
                        }
                    } catch (hotelError: any) {
                    }
                }

                // Gọi API reviews
                // Nếu là PARTNER và có hotels, filter theo hotelId
                // Backend API docs: GET /reviews với hotelId query param
                let reviewsResponse;

                if (roleName?.toLowerCase() === 'partner' && hotelIds.length > 0) {
                    // PARTNER: Lấy reviews của tất cả hotels họ sở hữu
                    // Có thể cần gọi nhiều lần cho mỗi hotel, hoặc backend hỗ trợ filter
                    // Theo API docs, có thể filter theo hotelId
                    // Thử lấy tất cả reviews và filter ở frontend, hoặc gọi API cho từng hotel
                    
                    // Cách 1: Gọi API với hotelId đầu tiên (hoặc có thể backend hỗ trợ nhiều hotelIds)
                    // Cách 2: Gọi API không có filter và filter ở frontend (không hiệu quả)
                    // Cách 3: Gọi API cho từng hotel và merge kết quả
                    
                    // Tạm thời: Gọi API với hotelId đầu tiên
                    // TODO: Nếu có nhiều hotels, có thể cần gọi nhiều lần hoặc backend hỗ trợ array hotelIds
                    
                    // Thử gọi với hotelId đầu tiên
                    reviewsResponse = await getReviews({
                        hotelId: hotelIds[0],
                        page: currentPage - 1, // Backend dùng 0-based
                        size: ITEMS_PER_PAGE,
                        sortBy: 'createdAt',
                        sortDir: 'DESC',
                        roleName: roleName,
                        currentUserId: userId,
                    });
                    
                    // Nếu có nhiều hotels, có thể cần merge kết quả từ nhiều API calls
                    // Nhưng do pagination, tạm thời chỉ lấy reviews của hotel đầu tiên
                } else {
                    // ADMIN hoặc không có hotels: Lấy tất cả reviews
                    reviewsResponse = await getReviews({
                        page: currentPage - 1,
                        size: ITEMS_PER_PAGE,
                        sortBy: 'createdAt',
                        sortDir: 'DESC',
                        roleName: roleName,
                        currentUserId: userId,
                    });
                }

                setReviews(reviewsResponse.data);
                setTotalPages(reviewsResponse.totalPages);
                setTotalItems(reviewsResponse.totalItems);

            } catch (error: any) {

                const errorMessage = error.message || 'Lỗi không xác định';
                alert('Không thể tải danh sách đánh giá: ' + errorMessage);

                setReviews([]);
                setTotalPages(0);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        }

        loadReviews();
    }, [currentPage, effectiveUser?.id, effectiveUser?.role?.name]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Đánh giá</span>} />

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                    Đang tải dữ liệu đánh giá...
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Không có đánh giá nào.</p>
                    {effectiveUser?.role?.name?.toLowerCase() === 'partner' && (
                        <p className="text-sm text-gray-400 mt-2">
                            (Nếu bạn có khách sạn và có đánh giá, chúng sẽ hiển thị ở đây)
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-4 text-sm text-gray-600">
                        Tổng số: <span className="font-semibold">{totalItems}</span> đánh giá
                    </div>
                    <ReviewsTable reviews={reviews} />
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

