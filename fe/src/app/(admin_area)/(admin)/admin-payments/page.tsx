"use client";

import { useState, useEffect } from 'react';
import { getHotels } from '@/lib/AdminAPI/hotelService';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import LoadingSpinner from '@/components/Admin/common/LoadingSpinner';
import PaymentTransactionsTable from '@/components/AdminSuper/Payment/PaymentTransactionsTable';
import Pagination from '@/components/Admin/pagination/Pagination';
import { FaCreditCard, FaSearch } from 'react-icons/fa';
import type { PaymentTransaction } from '@/types';
import apiClient, { ApiResponse } from '@/service/apiClient';

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
    };
    hotel: {
        id: string;
        name: string;
        address?: string;
        partner?: {
            id: string;
            email: string;
            fullName: string;
        } | null;
    };
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    numberOfRooms: number;
    priceDetails: {
        originalPrice?: number;
        discountAmount?: number;
        appliedDiscount?: {
            id: string;
            code: string;
            percentage: number;
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

// Map booking to payment transaction
const mapBookingToTransaction = (booking: BookingResponse): PaymentTransaction => {
    const bookingStatus = (booking.status || '').toLowerCase();

    // Determine payment status based on booking status
    let paymentStatus: PaymentTransaction['status'] = 'pending';

    if (bookingStatus === 'confirmed' || bookingStatus === 'checked_in' ||
        bookingStatus === 'completed' || bookingStatus === 'rescheduled') {
        paymentStatus = 'success';
    } else if (bookingStatus === 'pending_payment') {
        // Check if expired
        if (booking.expiresAt) {
            const expiryDate = new Date(booking.expiresAt);
            if (expiryDate.getTime() < new Date().getTime()) {
                paymentStatus = 'failed';
            } else {
                paymentStatus = 'pending';
            }
        } else {
            paymentStatus = 'pending';
        }
    } else if (bookingStatus === 'cancelled') {
        // Check if refunded (if booking was confirmed before cancellation)
        paymentStatus = 'failed'; // Default to failed, could be refunded if needed
    }

    // Determine payment gateway and method from paymentUrl
    let paymentGateway = 'VNPay';
    let paymentMethod = 'VNPay';

    if (booking.paymentUrl) {
        if (booking.paymentUrl.includes('vnpay')) {
            paymentGateway = 'VNPay';
            paymentMethod = 'VNPay';
        } else if (booking.paymentUrl.includes('stripe')) {
            paymentGateway = 'Stripe';
            paymentMethod = 'Thẻ tín dụng';
        } else if (booking.paymentUrl.includes('paypal')) {
            paymentGateway = 'PayPal';
            paymentMethod = 'PayPal';
        } else if (booking.paymentUrl.includes('momo')) {
            paymentGateway = 'MoMo';
            paymentMethod = 'MoMo';
        }
    }

    // Extract transaction code from booking ID or payment URL
    const gatewayTransactionCode = booking.paymentUrl
        ? booking.paymentUrl.split('=').pop()?.substring(0, 20) || (booking.id || '').substring(0, 8).toUpperCase()
        : (booking.id || '').substring(0, 8).toUpperCase();

    // Determine paid_at based on status
    const paidAt = (paymentStatus === 'success' && bookingStatus !== 'pending_payment')
        ? new Date(booking.updatedAt)
        : null;

    // Determine refunded_at (if cancelled after being confirmed)
    const refundedAt = null;

    return {
        transaction_id: booking.id || '', // Use booking ID as transaction ID
        booking_id: booking.id || '',
        hotel_id: booking.hotel?.id || '',
        user_id: booking.user?.id || '',
        amount: booking.priceDetails?.originalPrice || booking.priceDetails?.finalPrice || 0,
        currency: 'VND',
        payment_method: paymentMethod,
        payment_gateway: paymentGateway,
        status: paymentStatus,
        gateway_transaction_code: gatewayTransactionCode,
        bank_code: null, // Not available in booking response
        created_at: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        paid_at: paidAt,
        refunded_at: refundedAt,
        discount_amount: booking.priceDetails?.discountAmount || 0,
        final_amount: booking.priceDetails?.finalPrice || 0,
        // Additional fields for display
        hotel_name: booking.hotel?.name || '',
        user_name: booking.user?.fullName || '',
        user_email: booking.user?.email || '',
    };
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export default function PaymentsPage() {
    const { effectiveUser } = useAuth();
    const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchTransactions = async (page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const roleName = effectiveUser?.role?.name;
            const userId = effectiveUser?.id;

            let allBookings: BookingResponse[] = [];
            let totalPagesCount = 0;
            let totalItemsCount = 0;

            // Nếu là PARTNER, phải lấy bookings của TẤT CẢ hotels họ sở hữu
            if (roleName?.toLowerCase() === 'partner' && userId) {
                console.log(`[PaymentsPage] Partner ${userId} - Fetching hotels...`);

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

                        console.log(`[PaymentsPage] Page ${hotelPage}: Got ${hotelsData.hotels.length} hotels (filtered by partner-id: ${userId})`);

                        hasMoreHotels = hotelsData.hasNext || false;
                        hotelPage++;
                    } catch (err: any) {
                        console.error(`[PaymentsPage] Error fetching hotels page ${hotelPage}:`, err);
                        hasMoreHotels = false;
                    }
                }

                console.log(`[PaymentsPage] Partner ${userId} owns ${allHotelIds.length} hotels:`, allHotelIds);

                if (allHotelIds.length === 0) {
                    // Partner không có hotels
                    console.log(`[PaymentsPage] Partner ${userId} has no hotels`);
                    allBookings = [];
                    totalPagesCount = 0;
                    totalItemsCount = 0;
                } else {
                    // 2. Lấy bookings của TẤT CẢ hotels (pagination cho mỗi hotel)
                    const allBookingsFromHotels: BookingResponse[] = [];
                    for (const hotelId of allHotelIds) {
                        try {
                            console.log(`[PaymentsPage] Fetching bookings for hotel ${hotelId}...`);
                            let bookingPage = 0;
                            const bookingPageSize = 50;
                            let hasMoreBookings = true;

                            while (hasMoreBookings) {
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
                                        page: bookingPage,
                                        size: bookingPageSize,
                                        'sort-by': 'created-at',
                                        'sort-dir': 'desc',
                                        'hotel-id': hotelId, // QUAN TRỌNG: Chỉ lấy bookings của hotel này
                                    },
                                });

                                if (response.data?.statusCode === 200 && response.data.data) {
                                    const bookings = response.data.data.content;

                                    // QUAN TRỌNG: Verify từng booking để đảm bảo chỉ lấy bookings của hotel này
                                    const validBookings = bookings.filter(b => {
                                        const bookingHotelId = b.hotel?.id;
                                        if (!bookingHotelId) {
                                            console.warn(`[PaymentsPage] WARNING: Booking ${b.id} has no hotel.id!`);
                                            return false;
                                        }
                                        if (bookingHotelId !== hotelId) {
                                            console.error(`[PaymentsPage] ERROR: Backend returned booking ${b.id} with hotel ${bookingHotelId}, but we requested hotel ${hotelId}! This is a backend bug.`);
                                            return false;
                                        }
                                        return true;
                                    });

                                    if (validBookings.length !== bookings.length) {
                                        console.error(`[PaymentsPage] ERROR: Backend returned ${bookings.length - validBookings.length} bookings NOT matching hotel ${hotelId}!`);
                                    }

                                    allBookingsFromHotels.push(...validBookings);
                                    console.log(`[PaymentsPage] Hotel ${hotelId} page ${bookingPage}: Got ${validBookings.length} valid bookings (total returned: ${bookings.length})`);

                                    hasMoreBookings = response.data.data.hasNext || false;
                                    bookingPage++;
                                } else {
                                    hasMoreBookings = false;
                                }
                            }
                        } catch (err: any) {
                            console.error(`[PaymentsPage] Error fetching bookings for hotel ${hotelId}:`, err);
                        }
                    }

                    console.log(`[PaymentsPage] Total bookings from all partner hotels: ${allBookingsFromHotels.length}`);

                    // 3. Sort và paginate
                    allBookingsFromHotels.sort((a, b) => {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });

                    totalItemsCount = allBookingsFromHotels.length;
                    totalPagesCount = Math.ceil(totalItemsCount / ITEMS_PER_PAGE);
                    const startIndex = page * ITEMS_PER_PAGE;
                    const endIndex = startIndex + ITEMS_PER_PAGE;
                    allBookings = allBookingsFromHotels.slice(startIndex, endIndex);
                }
            } else {
                // ADMIN: Gọi API bình thường
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
                    allBookings = response.data.data.content;
                    totalPagesCount = response.data.data.totalPages || 0;
                    totalItemsCount = response.data.data.totalItems || 0;
                }
            }

            // Map bookings to transactions
            const mappedTransactions = allBookings.map(mapBookingToTransaction);

            // Sort by created_at descending
            mappedTransactions.sort((a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

            setTransactions(mappedTransactions);
            setTotalPages(totalPagesCount);
            setTotalItems(totalItemsCount);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách giao dịch');
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage, effectiveUser?.id, effectiveUser?.role?.name]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesStatus = filterStatus === "ALL" || transaction.status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            searchQuery === "" ||
            (transaction.transaction_id || '').toLowerCase().includes(searchLower) ||
            (transaction.booking_id || '').toLowerCase().includes(searchLower) ||
            (transaction.hotel_name || '').toLowerCase().includes(searchLower) ||
            (transaction.user_name || '').toLowerCase().includes(searchLower) ||
            (transaction.user_email || '').toLowerCase().includes(searchLower) ||
            (transaction.gateway_transaction_code || '').toLowerCase().includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="px-4 py-3">
            <div className="mb-4 pb-3 border-b border-gray-300">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl mb-1 font-bold text-gray-900 flex items-center gap-2">
                            <FaCreditCard className="text-blue-600" />
                            Quản lý giao dịch
                        </h1>
                        {!isLoading && (
                            <p className="text-gray-600 text-sm mb-0 mt-2">
                                Tổng cộng: <span className="font-semibold text-blue-600">{totalItems}</span> giao dịch
                                {searchQuery && (
                                    <span className="ml-2">
                                        (Hiển thị: <span className="font-semibold text-blue-600">{filteredTransactions.length}</span>)
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="search" className="form-label">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control pl-10"
                                        id="search"
                                        placeholder="Tìm theo mã giao dịch, mã đơn, khách sạn, khách hàng..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="statusFilter" className="form-label">
                                    Lọc theo trạng thái
                                </label>
                                <select
                                    className="form-select"
                                    id="statusFilter"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="ALL">Tất cả</option>
                                    <option value="success">Thành công</option>
                                    <option value="pending">Đang chờ</option>
                                    <option value="failed">Thất bại</option>
                                    <option value="refunded">Đã hoàn tiền</option>
                                </select>
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFilterStatus("ALL");
                                    }}
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner message="Đang tải danh sách giao dịch..." />
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                    <strong className="text-red-800">Lỗi:</strong> <span className="text-red-700">{error}</span>
                </div>
            ) : (
                <>
                    {/* Transactions Table */}
                    <PaymentTransactionsTable transactions={filteredTransactions} />

                    {/* Pagination */}
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
