"use client";

import { useState } from "react";
import PaymentTransactionsTable from "@/components/AdminSuper/Payment/PaymentTransactionsTable";
import type { PaymentTransaction } from "@/types";

// Dữ liệu hardcode - sẽ thay thế bằng API sau
const MOCK_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
    {
        id: "1",
        adminName: "Nguyễn Văn A",
        adminEmail: "admin1@hotel.com",
        hotelName: "Hoang Ngoc Beach Resort",
        hotelId: "00d60e60-d366-4d73-b3c0-614ecb95feb7",
        paymentDate: new Date("2025-01-15T10:30:00"),
        expiryDate: new Date("2026-01-15T23:59:59"),
        amount: 5000000,
        status: "PAID",
        paymentMethod: "VNPay",
        transactionId: "TXN-20250115-001",
        description: "Thanh toán phí dịch vụ tháng 1/2025",
    },
    {
        id: "2",
        adminName: "Trần Thị B",
        adminEmail: "admin2@hotel.com",
        hotelName: "Sunset Hotel & Resort",
        hotelId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        paymentDate: new Date("2025-01-10T14:20:00"),
        expiryDate: new Date("2026-01-10T23:59:59"),
        amount: 7500000,
        status: "PAID",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN-20250110-002",
        description: "Thanh toán phí dịch vụ tháng 1/2025",
    },
    {
        id: "3",
        adminName: "Lê Văn C",
        adminEmail: "admin3@hotel.com",
        hotelName: "Ocean View Hotel",
        hotelId: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        paymentDate: new Date("2025-01-05T09:15:00"),
        expiryDate: new Date("2026-01-05T23:59:59"),
        amount: 6000000,
        status: "PENDING",
        paymentMethod: "VNPay",
        transactionId: "TXN-20250105-003",
        description: "Thanh toán phí dịch vụ tháng 1/2025 - Đang chờ xử lý",
    },
    {
        id: "4",
        adminName: "Phạm Thị D",
        adminEmail: "admin4@hotel.com",
        hotelName: "Mountain Peak Resort",
        hotelId: "c3d4e5f6-a7b8-9012-cdef-345678901234",
        paymentDate: new Date("2024-12-28T16:45:00"),
        expiryDate: new Date("2025-12-28T23:59:59"),
        amount: 8000000,
        status: "EXPIRED",
        paymentMethod: "Bank Transfer",
        transactionId: "TXN-20241228-004",
        description: "Thanh toán phí dịch vụ tháng 12/2024 - Đã hết hạn",
    },
    {
        id: "5",
        adminName: "Hoàng Văn E",
        adminEmail: "admin5@hotel.com",
        hotelName: "City Center Hotel",
        hotelId: "d4e5f6a7-b8c9-0123-defa-456789012345",
        paymentDate: new Date("2025-01-20T11:00:00"),
        expiryDate: new Date("2026-01-20T23:59:59"),
        amount: 4500000,
        status: "PAID",
        paymentMethod: "VNPay",
        transactionId: "TXN-20250120-005",
        description: "Thanh toán phí dịch vụ tháng 1/2025",
    },
];

export default function SuperPaymentPage() {
    const [transactions] = useState<PaymentTransaction[]>(MOCK_PAYMENT_TRANSACTIONS);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Filter transactions
    const filteredTransactions = transactions.filter((transaction) => {
        const matchesStatus = filterStatus === "ALL" || transaction.status === filterStatus;
        const matchesSearch =
            searchQuery === "" ||
            transaction.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 text-dark mb-0">Quản lý giao dịch</h1>
                <div className="text-muted small">
                    <span className="badge bg-info">Dữ liệu mẫu</span>
                </div>
            </div>

            {/* Filter và Search */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="search" className="form-label">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="search"
                                placeholder="Tìm theo tên admin, khách sạn, mã giao dịch..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
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
                                <option value="PAID">Đã thanh toán</option>
                                <option value="PENDING">Đang chờ</option>
                                <option value="EXPIRED">Đã hết hạn</option>
                                <option value="FAILED">Thất bại</option>
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

            {/* Thống kê nhanh */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-primary">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Tổng giao dịch</h6>
                            <h4 className="card-title text-primary mb-0">
                                {transactions.length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Đã thanh toán</h6>
                            <h4 className="card-title text-success mb-0">
                                {transactions.filter((t) => t.status === "PAID").length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Đang chờ</h6>
                            <h4 className="card-title text-warning mb-0">
                                {transactions.filter((t) => t.status === "PENDING").length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-danger">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Tổng tiền</h6>
                            <h4 className="card-title text-danger mb-0">
                                {transactions
                                    .filter((t) => t.status === "PAID")
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toLocaleString("vi-VN")}{" "}
                                VND
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng giao dịch */}
            <PaymentTransactionsTable transactions={filteredTransactions} />
        </div>
    );
}


