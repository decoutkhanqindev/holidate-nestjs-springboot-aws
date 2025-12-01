"use client";

import { useState, useEffect } from "react";
import "./booking-table.css";
import apiClient, { ApiResponse } from "@/service/apiClient";
import Pagination from "@/components/Admin/pagination/Pagination";
import { FaEye, FaHotel, FaSearch } from "react-icons/fa";

interface BookingResponse {
    id: string;
    user: {
        id: string;
        email: string;
        fullName: string;
    };
    room: {
        id: string;
        name: string;
        view?: string;
        area?: number;
        maxAdults?: number;
        maxChildren?: number;
        basePricePerNight?: number;
        bedType?: {
            id: string;
            name: string;
        };
    };
    hotel: {
        id: string;
        name: string;
        address?: string;
        country?: { id: string; name: string; code: string };
        province?: { id: string; name: string; code: string };
        city?: { id: string; name: string; code: string };
        latitude?: number;
        longitude?: number;
        starRating?: number;
        status?: string;
    };
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    numberOfRooms: number;
    numberOfAdults: number;
    numberOfChildren: number;
    priceDetails: {
        originalPrice?: number;
        discountAmount?: number;
        appliedDiscount?: {
            id: string;
            code: string;
            percentage: number;
            description?: string;
        } | null;
        netPriceAfterDiscount?: number;
        tax?: {
            name: string;
            percentage: number;
            amount: number;
        };
        serviceFee?: {
            name: string;
            percentage: number;
            amount: number;
        };
        finalPrice: number;
    };
    contactFullName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    paymentUrl?: string | null;
    createdAt: string;
    expiresAt?: string | null;
    updatedAt: string;
}

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    } catch {
        return dateString;
    }
};

const formatDateTime = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
        'pending_payment': { label: 'Chờ thanh toán', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
        'confirmed': { label: 'Đã xác nhận', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
        'checked_in': { label: 'Đã nhận phòng', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
        'cancelled': { label: 'Đã hủy', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
        'completed': { label: 'Hoàn thành', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' },
        'rescheduled': { label: 'Đã đổi lịch', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' };
    return (
        <span className={`${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} border px-3 py-1 rounded text-xs font-medium`}>
            {statusInfo.label}
        </span>
    );
};

export default function SuperNewsPage() {
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchBookings = async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ApiResponse<{
                content: BookingResponse[];
                page: number;
                size: number;
                totalItems: number;
                totalPages: number;
                first: boolean;
                last: boolean;
                hasNext: boolean;
                hasPrevious: boolean;
            }>>('/bookings', {
                params: {
                    page: page,
                    size: ITEMS_PER_PAGE,
                    'sort-by': 'created-at',
                    'sort-dir': 'desc',
                },
            });

            if (response.data?.statusCode === 200 && response.data.data) {
                setBookings(response.data.data.content || []);
                setTotalPages(response.data.data.totalPages || 0);
                setTotalItems(response.data.data.totalItems || 0);
            } else {
                setBookings([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách đơn hàng');
            console.error('Error fetching bookings:', err);
            setBookings([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    // Filter bookings based on search term
    const filteredBookings = bookings.filter((booking) => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            booking.id.toLowerCase().includes(search) ||
            booking.user.fullName.toLowerCase().includes(search) ||
            booking.user.email.toLowerCase().includes(search)
        );
    });

    return (
        <div className="px-4 py-3" style={{ width: '100%', maxWidth: '100%', overflow: 'visible' }}>
            {/* Header Section */}
            <div className="mb-4 pb-3 border-b border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl mb-1 font-bold text-gray-900 flex items-center gap-2">
                            <FaHotel className="text-blue-600" />
                            Quản lý đơn hàng
                        </h1>
                        {!isLoading && (
                            <p className="text-gray-600 text-sm mb-0 mt-2">
                                Tổng cộng: <span className="font-semibold text-blue-600">{totalItems}</span> đơn hàng
                                {searchTerm && (
                                    <span className="ml-2">
                                        (Hiển thị: <span className="font-semibold text-blue-600">{filteredBookings.length}</span>)
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>
                {/* Search Box */}
                <div className="relative" style={{ width: '300px' }}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs"
                        placeholder="Tìm kiếm theo mã đơn, tên, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '300px', fontSize: '0.75rem' }}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="mt-3 text-gray-600">Đang tải danh sách đơn hàng...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                    <strong className="text-red-800">Lỗi:</strong> <span className="text-red-700">{error}</span>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ width: '100%', overflow: 'visible', position: 'relative' }}>
                        <div
                            className="table-scroll-container"
                            id="booking-table-scroll"
                            style={{
                                width: '100%',
                                overflowX: 'scroll',
                                overflowY: 'hidden',
                                display: 'block',
                                position: 'relative',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'auto',
                                scrollbarColor: '#888 #ffffff',
                                maxWidth: '100%'
                            }}
                        >
                            <table className="border-collapse" style={{
                                minWidth: '1100px',
                                width: 'max-content',
                                tableLayout: 'auto',
                                margin: 0
                            }}>
                                <thead>
                                    <tr className="bg-gradient-to-br from-white to-gray-50 border-b-2 border-gray-300">
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '1cm', minWidth: '1cm' }}>STT</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '3cm', minWidth: '3cm' }}>Mã đơn</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '4cm', minWidth: '4cm' }}>Khách hàng</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '5.5cm', minWidth: '5.5cm' }}>Khách sạn</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '3cm', minWidth: '3cm' }}>Phòng</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '2.5cm', minWidth: '2.5cm', paddingLeft: '0.2cm' }}>Ngày nhận - trả</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '2cm', minWidth: '2cm', paddingLeft: '0.1cm' }}>Số đêm</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '1.8cm', minWidth: '1.8cm', paddingLeft: '0.1cm' }}>Tổng tiền</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '3.5cm', minWidth: '3.5cm', paddingLeft: '0.1cm' }}>Trạng thái</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '1.8cm', minWidth: '1.8cm', paddingLeft: '0.1cm' }}>Ngày tạo</th>
                                        <th className="px-3 py-3 text-left font-bold text-gray-900 whitespace-nowrap" style={{ width: '1.3cm', minWidth: '1.3cm', paddingLeft: '0.1cm' }}>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan={11} className="text-center py-12">
                                                <div className="text-gray-400">
                                                    <FaHotel className="mx-auto mb-3" style={{ fontSize: '3rem', opacity: 0.3 }} />
                                                    <p className="mb-0 text-lg font-medium">
                                                        {searchTerm ? 'Không tìm thấy kết quả' : 'Không có đơn hàng nào'}
                                                    </p>
                                                    <p className="text-sm mb-0 mt-2">
                                                        {searchTerm
                                                            ? 'Thử tìm kiếm với từ khóa khác'
                                                            : 'Hiện tại chưa có đơn hàng nào trong hệ thống'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((booking, index) => {
                                            // Find original index for STT calculation
                                            const originalIndex = bookings.findIndex(b => b.id === booking.id);
                                            return (
                                                <tr
                                                    key={booking.id}
                                                    className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-default"
                                                >
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '1cm' }}>
                                                        <span className="text-gray-600 font-medium text-sm">
                                                            {originalIndex >= 0 ? (currentPage * ITEMS_PER_PAGE) + originalIndex + 1 : index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '3cm' }}>
                                                        <code
                                                            className="text-blue-600 font-mono text-sm font-medium break-all inline-block max-w-full"
                                                            title={booking.id}
                                                        >
                                                            {booking.id}
                                                        </code>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '4cm' }}>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 mb-2 text-sm">
                                                                {booking.user.fullName}
                                                            </div>
                                                            <div className="text-gray-600 mb-1 text-xs">
                                                                <span className="break-words" style={{ maxWidth: '4cm' }}>{booking.user.email}</span>
                                                            </div>
                                                            <div className="text-gray-600 text-xs">
                                                                <span>{booking.contactPhone}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '5.5cm' }}>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 mb-2 text-sm">
                                                                {booking.hotel.name}
                                                            </div>
                                                            {booking.hotel.address && (
                                                                <div
                                                                    className="text-gray-600 text-xs break-words"
                                                                    style={{
                                                                        lineHeight: '1.4',
                                                                        maxWidth: '5.5cm',
                                                                        overflowWrap: 'break-word'
                                                                    }}
                                                                >
                                                                    {booking.hotel.address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '3cm' }}>
                                                        <div
                                                            className="font-medium text-gray-900 mb-1 text-sm break-words"
                                                            style={{
                                                                maxWidth: '3cm',
                                                                overflowWrap: 'break-word'
                                                            }}
                                                        >
                                                            {booking.room.name}
                                                        </div>
                                                        {booking.room.view && (
                                                            <div
                                                                className="text-gray-600 text-xs break-words"
                                                                style={{
                                                                    maxWidth: '3cm'
                                                                }}
                                                            >
                                                                <span>{booking.room.view}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '2.5cm', paddingLeft: '0.2cm' }}>
                                                        <div className="text-gray-900">
                                                            <div className="mb-1 text-sm">{formatDate(booking.checkInDate)}</div>
                                                            <div className="text-gray-600 text-xs">{formatDate(booking.checkOutDate)}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '2cm', paddingLeft: '0.1cm' }}>
                                                        <div className="font-medium text-gray-900 mb-1 text-sm">{booking.numberOfNights} đêm</div>
                                                        <div className="text-gray-600 text-xs" style={{ lineHeight: '1.4' }}>
                                                            {booking.numberOfRooms} phòng, {booking.numberOfAdults} người lớn
                                                            {booking.numberOfChildren > 0 && `, ${booking.numberOfChildren} trẻ em`}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '1.8cm', paddingLeft: '0.1cm' }}>
                                                        <div className="font-bold text-blue-600 mb-1 text-sm">
                                                            {formatCurrency(booking.priceDetails.finalPrice)}
                                                        </div>
                                                        {booking.priceDetails.appliedDiscount && (
                                                            <div className="text-green-600 flex items-center gap-1 text-xs">
                                                                <span className="bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded text-xs">
                                                                    {booking.priceDetails.appliedDiscount.code}
                                                                    {' '}(-{booking.priceDetails.appliedDiscount.percentage}%)
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '3.5cm', paddingLeft: '0.1cm' }}>
                                                        {getStatusBadge(booking.status)}
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '1.8cm', paddingLeft: '0.1cm' }}>
                                                        <div className="text-gray-900 text-sm">
                                                            {formatDateTime(booking.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-left align-middle" style={{ width: '1.3cm', paddingLeft: '0.1cm' }}>
                                                        <button
                                                            className="inline-flex items-center justify-center rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 hover:scale-110 transition-all duration-200"
                                                            style={{
                                                                width: '38px',
                                                                height: '38px'
                                                            }}
                                                            title="Xem chi tiết"
                                                            onClick={() => {
                                                                console.log('View booking:', booking.id);
                                                            }}
                                                        >
                                                            <FaEye className="text-sm" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                            <Pagination
                                currentPage={currentPage + 1}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
