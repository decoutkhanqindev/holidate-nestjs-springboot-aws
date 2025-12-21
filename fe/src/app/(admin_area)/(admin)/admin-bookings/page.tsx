// app/admin-bookings/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import BookingsTable from '@/components/Admin/booking/BookingsTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import LoadingSpinner from '@/components/Admin/common/LoadingSpinner';
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

                    if (tokenScope !== 'partner' && tokenScope !== 'admin') {
                    }
                } catch (e) {
                }

                // Lấy userId và roleName từ AuthContext
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;

                // Nếu là PARTNER, phải lấy bookings của TẤT CẢ hotels họ sở hữu
                if (roleName?.toLowerCase() === 'partner' && userId) {
                    console.log(`[BookingsPage] Partner ${userId} - Fetching hotels...`);
                    
                    // 1. Lấy TẤT CẢ hotels của partner (pagination)
                    const allHotelIds: string[] = [];
                    let hotelPage = 0;
                    const hotelPageSize = 50;
                    let hasMoreHotels = true;

                    while (hasMoreHotels) {
                        try {
                            const hotelsData = await getHotels(
                                hotelPage,
                                hotelPageSize,
                                undefined,
                                undefined,
                                userId, // QUAN TRỌNG: Filter theo partner-id
                                'PARTNER'
                            );
                            
                            // Backend đã filter theo partner-id trong query params, nên tất cả hotels trả về đều thuộc partner này
                            // Không cần verify ownerId vì backend đã filter đúng
                            const pageHotelIds = hotelsData.hotels.map(h => h.id);
                            allHotelIds.push(...pageHotelIds);
                            
                            console.log(`[BookingsPage] Page ${hotelPage}: Got ${hotelsData.hotels.length} hotels (filtered by partner-id: ${userId})`);
                            
                            hasMoreHotels = hotelsData.hasNext || false;
                            hotelPage++;
                        } catch (err: any) {
                            console.error(`[BookingsPage] Error fetching hotels page ${hotelPage}:`, err);
                            hasMoreHotels = false;
                        }
                    }

                    console.log(`[BookingsPage] Partner ${userId} owns ${allHotelIds.length} hotels:`, allHotelIds);

                    if (allHotelIds.length === 0) {
                        // Partner không có hotels
                        console.log(`[BookingsPage] Partner ${userId} has no hotels`);
                        setBookings([]);
                        setTotalPages(0);
                        setTotalItems(0);
                        return;
                    }

                    // 2. Lấy bookings của TẤT CẢ hotels (pagination cho mỗi hotel)
                    const allBookings: Booking[] = [];
                    for (const hotelId of allHotelIds) {
                        try {
                            console.log(`[BookingsPage] Fetching bookings for hotel ${hotelId}...`);
                            let bookingPage = 0;
                            const bookingPageSize = 50;
                            let hasMoreBookings = true;

                            while (hasMoreBookings) {
                                const hotelBookings = await getBookings({
                                    page: bookingPage,
                                    size: bookingPageSize,
                                    sortBy: 'createdAt',
                                    sortDir: 'DESC',
                                    hotelId: hotelId, // QUAN TRỌNG: Chỉ lấy bookings của hotel này
                                    roleName: roleName,
                                    currentUserId: userId,
                                });
                                
                                // Verify: bookings phải thuộc hotel này (kiểm tra qua room.hotelId nếu có)
                                const validBookings = hotelBookings.data.filter((booking: Booking) => {
                                    // Booking type không có hotel.id trực tiếp, nhưng có thể verify qua room
                                    // Nếu có cách verify khác thì thêm vào đây
                                    return true; // Tạm thời trust backend filter
                                });
                                
                                allBookings.push(...validBookings);
                                console.log(`[BookingsPage] Hotel ${hotelId} page ${bookingPage}: Got ${validBookings.length} bookings`);
                                
                                hasMoreBookings = hotelBookings.totalPages > bookingPage + 1;
                                bookingPage++;
                            }
                        } catch (err: any) {
                            console.error(`[BookingsPage] Error fetching bookings for hotel ${hotelId}:`, err);
                        }
                    }
                    
                    console.log(`[BookingsPage] Total bookings from all partner hotels: ${allBookings.length}`);

                    // 3. Sort và paginate
                    allBookings.sort((a, b) => b.checkInDate.getTime() - a.checkInDate.getTime());
                    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    const paginatedBookings = allBookings.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(allBookings.length / ITEMS_PER_PAGE);

                    setBookings(paginatedBookings);
                    setTotalPages(totalPages);
                    setTotalItems(allBookings.length);
                } else {
                    // ADMIN: Gọi API bình thường
                    const bookingsResponse = await getBookings({
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
                }
            } catch (error: any) {


                // Kiểm tra token hiện tại
                const currentToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                if (currentToken) {
                    try {
                        const payload = JSON.parse(atob(currentToken.split('.')[1]));
                    } catch (e) {
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
                <LoadingSpinner message="Đang tải danh sách đơn hàng..." />
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