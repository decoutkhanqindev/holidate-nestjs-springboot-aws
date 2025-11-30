// app/admin-payments/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { getBookings } from '@/lib/AdminAPI/bookingService';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import type { Booking, PaymentStatus } from '@/types';

function PageHeader({ title }: { title: React.ReactNode }) {
    return (
        <div className="mb-8 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        </div>
    );
}

// Component hiển thị thẻ thống kê
function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        red: 'bg-red-50 border-red-200 text-red-700',
        gray: 'bg-gray-50 border-gray-200 text-gray-700',
    };

    return (
        <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value.toLocaleString('vi-VN')}</p>
                </div>
                <div className="text-4xl opacity-60">
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function PaymentsPage() {
    const { effectiveUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [totalBookingsCount, setTotalBookingsCount] = useState(0); // Tổng số bookings thực tế
    const [stats, setStats] = useState({
        paid: 0,           // Đã thanh toán
        unpaid: 0,         // Chưa thanh toán
        pending: 0,        // Đặt cọc / Chờ xử lý
        refunded: 0,       // Hoàn tiền
        cancelled: 0,      // Đã hủy (có thể có hoàn tiền hoặc không)
    });

    useEffect(() => {
        async function loadPaymentStats() {
            setIsLoading(true);
            try {
                const userId = effectiveUser?.id;
                const roleName = effectiveUser?.role?.name;


                // Lấy hotels của PARTNER nếu cần
                let hotelIds: string[] = [];
                if (roleName?.toLowerCase() === 'partner' && userId) {
                    try {
                        const hotelsData = await getHotels(0, 1000, undefined, undefined, userId, roleName);
                        hotelIds = hotelsData.hotels.map(h => h.id);
                    } catch (hotelError: any) {
                    }
                }

                // Lấy tất cả bookings để tính toán thống kê
                // Vì cần thống kê, nên lấy nhiều records hơn (size lớn hơn)
                const allBookings: Booking[] = [];
                let currentPage = 0;
                let hasMore = true;

                // Lấy tất cả bookings (có thể cần nhiều pages)
                while (hasMore && currentPage < 10) { // Giới hạn tối đa 10 pages để tránh quá tải
                    try {
                        const response = roleName?.toLowerCase() === 'partner' && hotelIds.length > 0
                            ? await getBookings({
                                page: currentPage,
                                size: 100, // Lấy nhiều hơn để tính toán
                                sortBy: 'createdAt',
                                sortDir: 'DESC',
                                roleName: roleName,
                                currentUserId: userId,
                                hotelId: hotelIds[0], // PARTNER: lấy bookings của hotel đầu tiên
                            })
                            : await getBookings({
                                page: currentPage,
                                size: 100,
                                sortBy: 'createdAt',
                                sortDir: 'DESC',
                                roleName: roleName,
                                currentUserId: userId,
                            });

                        allBookings.push(...response.data);
                        
                        // Kiểm tra xem còn trang nào không
                        hasMore = response.totalPages > currentPage + 1;
                        currentPage++;
                    } catch (error: any) {
                        hasMore = false;
                    }
                }


                // Tính toán thống kê
                // Logic: 
                // - Đã thanh toán: paymentStatus = PAID và bookingStatus không phải CANCELLED
                // - Chưa thanh toán: paymentStatus = UNPAID
                // - Đặt cọc / Chờ xử lý: paymentStatus = PENDING
                // - Hoàn tiền: paymentStatus = REFUNDED
                // - Đã hủy: bookingStatus = CANCELLED (bất kể paymentStatus)
                const newStats = {
                    paid: 0,
                    unpaid: 0,
                    pending: 0,
                    refunded: 0,
                    cancelled: 0,
                };

                // Tính tổng số booking (không double count)
                const totalBookings = allBookings.length;

                allBookings.forEach(booking => {
                    // Đếm cancelled trước (theo bookingStatus)
                    if (booking.bookingStatus === 'CANCELLED') {
                        newStats.cancelled++;
                        // Nếu cancelled và có refund, cũng đếm vào refunded
                        if (booking.paymentStatus === 'REFUNDED') {
                            newStats.refunded++;
                        }
                        return; // Không đếm vào các category khác nếu đã cancelled
                    }

                    // Đếm theo paymentStatus cho các booking chưa cancelled
                    switch (booking.paymentStatus) {
                        case 'PAID':
                            newStats.paid++;
                            break;
                        case 'UNPAID':
                            newStats.unpaid++;
                            break;
                        case 'PENDING':
                            newStats.pending++;
                            break;
                        case 'REFUNDED':
                            newStats.refunded++;
                            break;
                        default:
                            // Nếu paymentStatus không rõ, phân loại theo bookingStatus
                            if (booking.bookingStatus === 'PENDING') {
                                newStats.pending++;
                            } else {
                                newStats.unpaid++;
                            }
                    }
                });

                // Log để debug
                console.log("[PaymentsPage] Breakdown:", {
                    paid: newStats.paid,
                    unpaid: newStats.unpaid,
                    pending: newStats.pending,
                    cancelled: newStats.cancelled,
                    refunded: newStats.refunded,
                    sum: newStats.paid + newStats.unpaid + newStats.pending + newStats.cancelled + newStats.refunded,
                    totalBookings: totalBookings
                });

                setStats(newStats);
                setTotalBookingsCount(totalBookings); // Lưu tổng số bookings thực tế
            } catch (error: any) {
                alert('Không thể tải thống kê thanh toán: ' + (error.message || 'Lỗi không xác định'));
            } finally {
                setIsLoading(false);
            }
        }

        loadPaymentStats();
    }, [effectiveUser?.id, effectiveUser?.role?.name]);

    if (isLoading) {
        return (
            <div>
                <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Thanh toán</span>} />
                <div className="text-center py-8 text-gray-500">
                    Đang tải thống kê thanh toán...
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader title={<span style={{ color: '#2563eb' }}>Quản lý Thanh toán</span>} />

            {/* Dashboard thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard
                    title="Đã Thanh toán"
                    value={stats.paid}
                    icon={<span>💰</span>}
                    color="green"
                />
                <StatsCard
                    title="Chưa Thanh toán"
                    value={stats.unpaid}
                    icon={<span>⏳</span>}
                    color="yellow"
                />
                <StatsCard
                    title="Đặt Cọc / Chờ Xử lý"
                    value={stats.pending}
                    icon={<span>📝</span>}
                    color="blue"
                />
                <StatsCard
                    title="Đã Hủy"
                    value={stats.cancelled}
                    icon={<span>❌</span>}
                    color="red"
                />
                <StatsCard
                    title="Hoàn Tiền"
                    value={stats.refunded}
                    icon={<span>↩️</span>}
                    color="gray"
                />
            </div>

            {/* Tổng kết */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Tổng quan</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng số đơn hàng</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {totalBookingsCount.toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tỷ lệ thanh toán thành công</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                            {stats.paid + stats.unpaid + stats.pending > 0
                                ? `${Math.round((stats.paid / (stats.paid + stats.unpaid + stats.pending)) * 100)}%`
                                : '0%'}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tỷ lệ hủy đơn</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">
                            {stats.paid + stats.unpaid + stats.pending + stats.cancelled > 0
                                ? `${Math.round((stats.cancelled / (stats.paid + stats.unpaid + stats.pending + stats.cancelled)) * 100)}%`
                                : '0%'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

