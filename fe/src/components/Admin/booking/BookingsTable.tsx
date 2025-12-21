// components/Admin/BookingsTable.tsx
"use client";

import type { Booking, PaymentStatus, BookingStatus } from '@/types';

// Component con để hiển thị badge trạng thái
function StatusBadge({ status, type }: { status: PaymentStatus | BookingStatus, type: 'payment' | 'booking' }) {
    const paymentStyles: Record<PaymentStatus, string> = {
        PAID: "bg-green-100 text-green-800",
        UNPAID: "bg-red-100 text-red-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        REFUNDED: "bg-gray-100 text-gray-800",
    };
    const bookingStyles: Record<BookingStatus, string> = {
        COMPLETED: "bg-blue-100 text-blue-800",
        CONFIRMED: "bg-green-100 text-green-800",
        PENDING: "bg-yellow-100 text-yellow-800",
        CANCELLED: "bg-red-100 text-red-800",
        CHECKED_IN: "bg-indigo-100 text-indigo-800",
    };
    const statusTextMap = {
        PAID: "Đã thanh toán", UNPAID: "Chưa thanh toán", PENDING: "Chờ xử lý", REFUNDED: "Đã hoàn tiền",
        COMPLETED: "Hoàn thành", CONFIRMED: "Đã xác nhận", CANCELLED: "Đã hủy", CHECKED_IN: "Đã check-in",
    };

    const styles = type === 'payment' ? paymentStyles[status as PaymentStatus] : bookingStyles[status as BookingStatus];
    const text = statusTextMap[status as keyof typeof statusTextMap] || status;

    return (
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${styles}`}>
            {text}
        </span>
    );
}

interface BookingsTableProps {
    bookings: Booking[];
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
    return (
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">STT</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">Tên Người Đặt</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">Phòng</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Check-in</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Check-out</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">Số Người Ở</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Số Điện Thoại</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">Tổng Tiền</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">Thanh Toán</th>
                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking, index) => {
                            const totalGuests = booking.numberOfAdults + booking.numberOfChildren;
                            const guestsText = `${booking.numberOfAdults} người lớn${booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} trẻ em` : ''}`;

                            return (
                                <tr key={booking.id} className={index % 2 !== 0 ? 'bg-gray-50' : 'bg-white hover:bg-gray-100'}>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-800">{index + 1}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customerName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{booking.roomNumbers.join(', ')}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{booking.checkInDate.toLocaleDateString('vi-VN')}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{booking.checkOutDate.toLocaleDateString('vi-VN')}</td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700" title={guestsText}>
                                        {totalGuests} ({booking.numberOfAdults}/{booking.numberOfChildren})
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{booking.phone || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{booking.totalAmount.toLocaleString('vi-VN')} VND</td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <StatusBadge status={booking.paymentStatus} type="payment" />
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <StatusBadge status={booking.bookingStatus} type="booking" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}