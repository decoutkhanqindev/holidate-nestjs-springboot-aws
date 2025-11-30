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
                // Kiểm tra token TRƯỚC KHI làm gì
                // QUAN TRỌNG: Mỗi trình duyệt có localStorage riêng
                // Admin PHẢI login trên chính trình duyệt đang dùng
                const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                if (!token) {
                    console.error("[BookingsPage] ⚠️ Không thể dùng token từ trình duyệt khác.");
                    alert('Bạn chưa đăng nhập hoặc đã đăng nhập trên trình duyệt khác.\n\nVui lòng đăng nhập lại trên trình duyệt này.');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/admin-login';
                    }
                    return;
                }

                // Kiểm tra token có phải của admin/partner không
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const tokenScope = payload.scope?.toLowerCase();
                    console.log("[BookingsPage] Token scope:", tokenScope);

                    if (tokenScope !== 'partner' && tokenScope !== 'admin') {
                        console.warn("[BookingsPage] ⚠️ Token không phải của admin/partner, có thể là token của USER");
                        console.warn("[BookingsPage] ⚠️ Đây có thể là token từ client login trên cùng trình duyệt");
                    }
                } catch (e) {
                    console.error("[BookingsPage] Cannot decode token:", e);
                }

                // Lấy userId và roleName từ AuthContext để filter theo owner nếu role là PARTNER
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;

                console.log("[BookingsPage] User info (effectiveUser):", { userId, roleName });

                // Nếu role là PARTNER, lấy danh sách hotels của họ trước
                // Sau đó lấy bookings của TẤT CẢ hotels đó
                let hotelIds: string[] = [];

                if (roleName?.toLowerCase() === 'partner' && userId) {
                    try {

                        const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                        hotelIds = hotelsData.hotels.map(h => h.id);


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
                        // Nếu không lấy được hotels, không thể lấy bookings
                        setBookings([]);
                        setTotalPages(0);
                        setTotalItems(0);
                        setIsLoading(false);
                        return;
                    }
                }

                // Gọi API bookings
                let bookingsResponse;

                if (roleName?.toLowerCase() === 'partner') {
                    console.log("[BookingsPage] ===== PARTNER: FETCHING BOOKINGS =====");
                    console.log("[BookingsPage] Total hotels to fetch:", hotelIds.length);
                    console.log("[BookingsPage] Hotel IDs:", hotelIds);

                    // PARTNER: Lấy bookings của TẤT CẢ hotels
                    // Vì API chỉ hỗ trợ 1 hotelId mỗi lần, ta sẽ:
                    // 1. Gọi API cho từng hotel với size lớn để lấy tất cả bookings
                    // 2. Merge tất cả bookings lại
                    // 3. Sort theo createdAt DESC
                    // 4. Paginate trên frontend
                    try {
                        const allBookings: Booking[] = [];

                        // Gọi API cho từng hotel
                        for (let i = 0; i < hotelIds.length; i++) {
                            const hotelId = hotelIds[i];
                            try {
                                console.log(`[BookingsPage] [${i + 1}/${hotelIds.length}] Fetching bookings for hotel: ${hotelId}`);
                                const hotelBookings = await getBookings({
                                    page: 0,
                                    size: 1000, // Lấy tất cả bookings của hotel này
                                    sortBy: 'createdAt',
                                    sortDir: 'DESC',
                                    hotelId: hotelId, // Lấy bookings theo hotelId
                                });
                                console.log(`[BookingsPage] Response: totalItems=${hotelBookings.totalItems}, totalPages=${hotelBookings.totalPages}`);
                                allBookings.push(...hotelBookings.data);
                            } catch (hotelBookingError: any) {
                                console.error(`[BookingsPage] ❌ Error fetching bookings for hotel ${hotelId}:`, hotelBookingError.message);
                                console.error(`[BookingsPage] Error response status:`, hotelBookingError.response?.status);
                                console.error(`[BookingsPage] Error response data:`, hotelBookingError.response?.data);
                                // Tiếp tục với hotel tiếp theo nếu có lỗi
                            }
                        }

                        console.log("[BookingsPage] ===== END FETCHING BOOKINGS =====");

                        // Sort tất cả bookings theo createdAt DESC (mới nhất trước)
                        allBookings.sort((a, b) => {
                            const dateA = a.checkInDate.getTime();
                            const dateB = b.checkInDate.getTime();
                            return dateB - dateA; // DESC
                        });


                        // Paginate trên frontend
                        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                        const endIndex = startIndex + ITEMS_PER_PAGE;
                        const paginatedBookings = allBookings.slice(startIndex, endIndex);
                        const totalPages = Math.ceil(allBookings.length / ITEMS_PER_PAGE);

                        setBookings(paginatedBookings);
                        setTotalPages(totalPages);
                        setTotalItems(allBookings.length);
                    } catch (error: any) {
                        console.error('[BookingsPage] ❌ Error fetching bookings for PARTNER:', error.message);
                        throw error;
                    }
                } else {
                    // ADMIN: Lấy tất cả bookings
                    bookingsResponse = await getBookings({
                        page: currentPage - 1,
                        size: ITEMS_PER_PAGE,
                        sortBy: 'createdAt',
                        sortDir: 'DESC',
                        roleName: roleName,
                        currentUserId: userId,
                    });

                    setBookings(bookingsResponse.data);
                    setTotalPages(bookingsResponse.totalPages);
                    setTotalItems(bookingsResponse.totalItems);

                    console.log("[BookingsPage] Total items:", bookingsResponse.totalItems);
                }
            } catch (error: any) {
                console.error('[BookingsPage] ===== ERROR DETAILS =====');

                console.error('[BookingsPage] Error response data:', error.response?.data);

                // Kiểm tra token hiện tại
                const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                console.error('[BookingsPage] Current token exists:', !!currentToken);
                if (currentToken) {
                    try {
                        const payload = JSON.parse(atob(currentToken.split('.')[1]));
                        console.error('[BookingsPage] Token payload:', payload);
                    } catch (e) {
                        console.error('[BookingsPage] Cannot decode token:', e);
                    }
                }

                // Hiển thị thông báo lỗi chi tiết hơn
                const errorMessage = error.message || 'Lỗi không xác định';
                const statusCode = error.response?.status;

                // Xử lý các loại lỗi
                if (!currentToken || errorMessage.includes('chưa đăng nhập') || statusCode === 401) {
                    alert('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    if (typeof window !== 'undefined') {
                        window.location.href = '/admin-login';
                    }
                } else if (statusCode === 403 || errorMessage.includes('không có quyền') || errorMessage.includes('not allowed')) {
                    // Lỗi 403 - có thể backend chưa restart sau khi sửa SecurityConfig
                    const detailedMessage =
                        'Bạn không có quyền truy cập tài nguyên này.\n\n' +
                        'VẤN ĐỀ CÓ THỂ DO:\n' +
                        '1. Backend chưa được restart sau khi sửa SecurityConfig\n' +
                        '2. JWT token không có scope đúng format\n' +
                        '3. Backend SecurityConfig chưa cho phép PARTNER truy cập /bookings\n\n' +
                        'VUI LÒNG:\n' +
                        '- Kiểm tra console logs để xem chi tiết\n' +
                        '- Restart backend server\n' +
                        '- Kiểm tra JWT token có scope: "partner" không';
                    alert(detailedMessage);
                    console.error('[BookingsPage] ⚠️ 403 Forbidden - Backend returned 403. Check backend logs and SecurityConfig.');
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