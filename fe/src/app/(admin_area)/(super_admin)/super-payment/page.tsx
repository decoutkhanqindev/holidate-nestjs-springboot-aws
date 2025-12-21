"use client";

import { useState, useEffect } from "react";
import PaymentTransactionsTable from "@/components/AdminSuper/Payment/PaymentTransactionsTable";
import type { PaymentTransaction } from "@/types";
import apiClient, { ApiResponse } from "@/service/apiClient";
import Pagination from "@/components/Admin/pagination/Pagination";
import { FaCreditCard, FaSearch } from "react-icons/fa";
import LoadingSpinner from "@/components/AdminSuper/common/LoadingSpinner";

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
    const bookingStatus = booking.status.toLowerCase();

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
        ? booking.paymentUrl.split('=').pop()?.substring(0, 20) || booking.id.substring(0, 8).toUpperCase()
        : booking.id.substring(0, 8).toUpperCase();

    // Determine paid_at based on status
    const paidAt = (paymentStatus === 'success' && bookingStatus !== 'pending_payment')
        ? new Date(booking.updatedAt)
        : null;

    // Determine refunded_at (if cancelled after being confirmed)
    // Note: We can't determine if it was refunded from booking status alone
    // This would require additional payment data
    const refundedAt = null;

    return {
        transaction_id: booking.id, // Use booking ID as transaction ID
        booking_id: booking.id,
        hotel_id: booking.hotel.id,
        user_id: booking.user.id,
        amount: booking.priceDetails.originalPrice || booking.priceDetails.finalPrice,
        currency: 'VND',
        payment_method: paymentMethod,
        payment_gateway: paymentGateway,
        status: paymentStatus,
        gateway_transaction_code: gatewayTransactionCode,
        bank_code: null, // Not available in booking response
        created_at: new Date(booking.createdAt),
        paid_at: paidAt,
        refunded_at: refundedAt,
        discount_amount: booking.priceDetails.discountAmount || 0,
        final_amount: booking.priceDetails.finalPrice,
        // Additional fields for display
        hotel_name: booking.hotel.name,
        user_name: booking.user.fullName,
        user_email: booking.user.email,
    };
};

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

export default function SuperPaymentPage() {
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
                const mappedTransactions = response.data.data.content.map(mapBookingToTransaction);
                setTransactions(mappedTransactions);
                setTotalPages(response.data.data.totalPages || 0);
                setTotalItems(response.data.data.totalItems || 0);
            } else {
                setTransactions([]);
                setTotalPages(0);
                setTotalItems(0);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Không thể tải danh sách giao dịch');
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(currentPage);
    }, [currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page - 1);
    };

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesStatus = filterStatus === "ALL" || transaction.status === filterStatus;
        const matchesSearch =
            searchQuery === "" ||
            transaction.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.hotel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.gateway_transaction_code?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Calculate statistics
    const stats = {
        total: transactions.length,
        success: transactions.filter((t) => t.status === "success").length,
        pending: transactions.filter((t) => t.status === "pending").length,
        failed: transactions.filter((t) => t.status === "failed").length,
        refunded: transactions.filter((t) => t.status === "refunded").length,
        totalAmount: transactions
            .filter((t) => t.status === "success")
            .reduce((sum, t) => sum + t.final_amount, 0),
    };

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
                    {/* Statistics Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-primary">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Tổng giao dịch</h6>
                                    <h4 className="card-title text-primary mb-0">{stats.total}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-success">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Thành công</h6>
                                    <h4 className="card-title text-success mb-0">{stats.success}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-warning">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Đang chờ</h6>
                                    <h4 className="card-title text-warning mb-0">{stats.pending}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-danger">
                                <div className="card-body">
                                    <h6 className="card-subtitle mb-2 text-muted">Tổng tiền</h6>
                                    <h4 className="card-title text-danger mb-0">
                                        {formatCurrency(stats.totalAmount)}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

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
