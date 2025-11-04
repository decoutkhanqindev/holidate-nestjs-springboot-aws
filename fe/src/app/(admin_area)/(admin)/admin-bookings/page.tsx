// app/admin-bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import BookingsTable from '@/components/Admin/booking/BookingsTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import type { Booking } from '@/types';

function PageHeader({ title, children }: { title: React.ReactNode, children?: React.ReactNode }) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

const ITEMS_PER_PAGE = 10;

export default function BookingsPage() {
    const { effectiveUser } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        async function loadBookings() {
            setIsLoading(true);
            try {
                // Lấy userId và roleName từ AuthContext để filter theo owner nếu role là PARTNER
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;

                console.log("[BookingsPage] User info (effectiveUser):", { userId, roleName });

                // Nếu role là PARTNER, lấy danh sách hotels của họ trước
                // Sau đó filter bookings theo hotelId của các hotels đó
                let hotelIds: string[] = [];

                if (roleName?.toLowerCase() === 'partner' && userId) {
                    try {
                        console.log("[BookingsPage] User is PARTNER, fetching hotels first...");
                        const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                        hotelIds = hotelsData.hotels.map(h => h.id);
                        console.log("[BookingsPage] Found hotels for PARTNER:", hotelIds.length, hotelIds);

                        // Nếu PARTNER không có hotels, không có bookings
                        if (hotelIds.length === 0) {
                            console.log("[BookingsPage] PARTNER has no hotels, no bookings available");
                            setBookings([]);
                            setTotalPages(0);
                            setTotalItems(0);
                            setIsLoading(false);
                            return;
                        }
                    } catch (hotelError: any) {
                        console.error('[BookingsPage] Error fetching hotels for PARTNER:', hotelError);
                        // Nếu không lấy được hotels, vẫn thử lấy bookings (backend có thể tự filter)
                    }
                }

                // Gọi API bookings
                // Nếu là PARTNER và có hotels, thử filter theo hotelId
                // Backend có thể yêu cầu hotelId để filter bookings cho PARTNER
                let bookingsResponse;

                if (roleName?.toLowerCase() === 'partner') {
                    console.log("[BookingsPage] PARTNER: Fetching bookings (backend should auto-filter from JWT token)");
                    console.log("[BookingsPage] PARTNER hotels:", hotelIds);

                    // Thử 1: Không gửi hotelId - backend tự filter từ JWT token (theo API docs, backend đã cấp quyền)
                    try {
                        bookingsResponse = await getBookings({
                            page: currentPage - 1,
                            size: ITEMS_PER_PAGE,
                            sortBy: 'createdAt',
                            sortDir: 'DESC',
                            roleName: roleName,
                            currentUserId: userId,
                            // KHÔNG gửi hotelId - để backend tự filter từ JWT token
                        });
                        console.log("[BookingsPage] ✅ Successfully fetched bookings without hotelId (backend auto-filtered)");
                    } catch (errorWithoutHotelId: any) {
                        console.warn('[BookingsPage] ⚠️ Failed without hotelId, trying with hotelId...', errorWithoutHotelId.message);

                        // Thử 2: Nếu backend không tự filter, gửi hotelId
                        if (hotelIds.length > 0) {
                            try {
                                bookingsResponse = await getBookings({
                                    page: currentPage - 1,
                                    size: ITEMS_PER_PAGE,
                                    sortBy: 'createdAt',
                                    sortDir: 'DESC',
                                    roleName: roleName,
                                    currentUserId: userId,
                                    hotelId: hotelIds[0], // Gửi hotelId đầu tiên
                                });
                                console.log("[BookingsPage] ✅ Successfully fetched bookings with hotelId");
                            } catch (errorWithHotelId: any) {
                                console.error('[BookingsPage] ❌ Failed with hotelId too:', errorWithHotelId.message);
                                throw errorWithHotelId; // Re-throw để hiển thị lỗi
                            }
                        } else {
                            throw new Error('Bạn chưa có khách sạn nào. Vui lòng tạo khách sạn trước.');
                        }
                    }
                } else {
                    // ADMIN hoặc không có hotels: Lấy tất cả bookings
                    bookingsResponse = await getBookings({
                        page: currentPage - 1,
                        size: ITEMS_PER_PAGE,
                        sortBy: 'createdAt',
                        sortDir: 'DESC',
                        roleName: roleName,
                        currentUserId: userId,
                    });
                }

                const response = bookingsResponse;

                setBookings(response.data);
                setTotalPages(response.totalPages);
                setTotalItems(response.totalItems);

                console.log("[BookingsPage] Received bookings:", response.data.length);
                console.log("[BookingsPage] Total items:", response.totalItems);
            } catch (error: any) {
                console.error('[BookingsPage] Error loading bookings:', error);
                console.error('[BookingsPage] Error message:', error.message);
                console.error('[BookingsPage] Error response:', error.response?.data);

                // Hiển thị thông báo lỗi chi tiết hơn
                const errorMessage = error.message || 'Lỗi không xác định';

                // Nếu là lỗi 401 hoặc 403, có thể cần redirect về trang login
                if (errorMessage.includes('hết hạn') || errorMessage.includes('đăng nhập')) {
                    alert(errorMessage);
                    // Redirect về trang login nếu cần
                    // window.location.href = '/admin-login';
                } else if (errorMessage.includes('không có quyền') || errorMessage.includes('not allowed')) {
                    // Lỗi 403 - có thể backend không cho phép PARTNER truy cập
                    alert('Bạn không có quyền truy cập tài nguyên này. Backend có thể chưa hỗ trợ PARTNER xem bookings.');
                    console.error('[BookingsPage] ⚠️ Backend returned 403 Forbidden. Backend needs to allow PARTNER to access /bookings endpoint.');
                } else {
                    alert('Không thể tải danh sách đặt phòng: ' + errorMessage);
                }

                setBookings([]);
                setTotalPages(0);
                setTotalItems(0);
            } finally {
                setIsLoading(false);
            }
        }
        loadBookings();
    }, [currentPage, effectiveUser?.id, effectiveUser?.role?.name]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Đặt phòng</span>}>
                <button
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
                    onClick={() => alert('Chức năng thêm đặt phòng mới sẽ được triển khai sau')}
                >
                    <PlusIcon className="h-5 w-5" />
                    Thêm Đặt Phòng
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                    Đang tải dữ liệu đặt phòng...
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>Không có đặt phòng nào.</p>
                    {effectiveUser?.role?.name?.toLowerCase() === 'partner' && (
                        <p className="text-sm text-gray-400 mt-2">
                            (Nếu bạn có khách sạn, bookings sẽ hiển thị ở đây)
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                        <span>
                            Tổng số: <span className="font-semibold">{totalItems}</span> đặt phòng
                        </span>
                        <span className="text-gray-400">|</span>
                        <span>
                            Đã hủy: <span className="font-semibold text-red-600">
                                {bookings.filter(b => b.bookingStatus === 'CANCELLED').length}
                            </span>
                        </span>
                    </div>
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