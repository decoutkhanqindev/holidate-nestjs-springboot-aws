// components/Admin/BookingsTable.tsx
"use client";

import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles}`}>
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
                <table className="min-w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">ID</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Tên Người Đặt</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Phòng</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Check-in</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Check-out</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Tổng Tiền</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Thanh Toán</th>
                            <th className="p-4 text-left text-sm font-semibold text-gray-600">Trạng Thái</th>
                            <th className="p-4 text-right text-sm font-semibold text-gray-600">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {bookings.map((booking, index) => (
                            <tr key={booking.id} className={index % 2 !== 0 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-800">{booking.id}</td>
                                <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customerName}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{booking.roomNumbers.join(', ')}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{booking.checkInDate.toLocaleDateString('vi-VN')}</td>
                                <td className="p-4 whitespace-nowrap text-sm text-gray-700">{booking.checkOutDate.toLocaleDateString('vi-VN')}</td>
                                <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-900">{booking.totalAmount.toLocaleString('vi-VN')} VND</td>
                                <td className="p-4 whitespace-nowrap"><StatusBadge status={booking.paymentStatus} type="payment" /></td>
                                <td className="p-4 whitespace-nowrap"><StatusBadge status={booking.bookingStatus} type="booking" /></td>
                                <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-x-4">
                                        <button
                                            onClick={() => alert(`(Giả lập) Xem chi tiết đặt phòng ID: ${booking.id}`)}
                                            className="text-green-600 hover:text-green-700 transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => alert(`(Giả lập) Chỉnh sửa đặt phòng ID: ${booking.id}`)}
                                            className="text-blue-600 hover:text-blue-700 transition-colors"
                                            title="Chỉnh sửa"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => confirm(`Bạn có chắc chắn muốn xóa đặt phòng ID: ${booking.id} không?`) && alert(`(Giả lập) Đã xóa đặt phòng ID: ${booking.id}`)}
                                            className="text-red-600 hover:text-red-700 transition-colors"
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