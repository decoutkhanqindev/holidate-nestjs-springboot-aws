"use client";

import type { PaymentTransaction } from "@/types";
import { FaEye, FaCheckCircle, FaClock, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

interface PaymentTransactionsTableProps {
    transactions: PaymentTransaction[];
}

// Component Status Badge
function StatusBadge({ status }: { status: PaymentTransaction["status"] }) {
    const statusConfig: Record<
        PaymentTransaction["status"],
        { label: string; className: string; icon: React.ReactNode }
    > = {
        PAID: {
            label: "Đã thanh toán",
            className: "bg-success-subtle text-success-emphasis",
            icon: <FaCheckCircle className="me-1" />,
        },
        PENDING: {
            label: "Đang chờ",
            className: "bg-warning-subtle text-warning-emphasis",
            icon: <FaClock className="me-1" />,
        },
        EXPIRED: {
            label: "Đã hết hạn",
            className: "bg-danger-subtle text-danger-emphasis",
            icon: <FaExclamationTriangle className="me-1" />,
        },
        FAILED: {
            label: "Thất bại",
            className: "bg-danger-subtle text-danger-emphasis",
            icon: <FaTimesCircle className="me-1" />,
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`badge ${config.className} d-flex align-items-center`} style={{ width: "fit-content" }}>
            {config.icon}
            {config.label}
        </span>
    );
}

export default function PaymentTransactionsTable({ transactions }: PaymentTransactionsTableProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const isExpiringSoon = (expiryDate: Date) => {
        const daysUntilExpiry = Math.ceil(
            (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    };

    const isExpired = (expiryDate: Date) => {
        return expiryDate.getTime() < new Date().getTime();
    };

    if (transactions.length === 0) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                    <p className="text-muted mb-0">Không tìm thấy giao dịch nào</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card shadow-sm">
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th scope="col" className="p-3" style={{ width: "5%" }}>
                                    STT
                                </th>
                                <th scope="col" className="p-3" style={{ width: "12%" }}>
                                    Admin Khách sạn
                                </th>
                                <th scope="col" className="p-3" style={{ width: "15%" }}>
                                    Khách sạn
                                </th>
                                <th scope="col" className="p-3" style={{ width: "10%" }}>
                                    Mã giao dịch
                                </th>
                                <th scope="col" className="p-3" style={{ width: "12%" }}>
                                    Thời gian thanh toán
                                </th>
                                <th scope="col" className="p-3" style={{ width: "12%" }}>
                                    Ngày hết hạn
                                </th>
                                <th scope="col" className="p-3" style={{ width: "10%" }}>
                                    Số tiền
                                </th>
                                <th scope="col" className="p-3" style={{ width: "10%" }}>
                                    Phương thức
                                </th>
                                <th scope="col" className="p-3" style={{ width: "10%" }}>
                                    Trạng thái
                                </th>
                                <th scope="col" className="p-3 text-end" style={{ width: "4%" }}>
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => {
                                const expiringSoon = isExpiringSoon(transaction.expiryDate);
                                const expired = isExpired(transaction.expiryDate);

                                return (
                                    <tr key={transaction.id}>
                                        <td className="p-3">{index + 1}</td>
                                        <td className="p-3">
                                            <div>
                                                <div className="fw-medium text-dark">
                                                    {transaction.adminName}
                                                </div>
                                                <small className="text-muted">
                                                    {transaction.adminEmail}
                                                </small>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="fw-medium text-dark">
                                                {transaction.hotelName}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <code className="text-primary small">
                                                {transaction.transactionId}
                                            </code>
                                        </td>
                                        <td className="p-3">
                                            <div className="small">
                                                {formatDate(transaction.paymentDate)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="small">
                                                <span
                                                    className={
                                                        expired
                                                            ? "text-danger fw-bold"
                                                            : expiringSoon
                                                            ? "text-warning fw-bold"
                                                            : ""
                                                    }
                                                >
                                                    {formatDate(transaction.expiryDate)}
                                                </span>
                                                {expired && (
                                                    <div className="badge bg-danger-subtle text-danger-emphasis ms-2">
                                                        Hết hạn
                                                    </div>
                                                )}
                                                {expiringSoon && !expired && (
                                                    <div className="badge bg-warning-subtle text-warning-emphasis ms-2">
                                                        Sắp hết hạn
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="fw-semibold text-dark">
                                                {formatCurrency(transaction.amount)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className="badge bg-info-subtle text-info-emphasis">
                                                {transaction.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <StatusBadge status={transaction.status} />
                                        </td>
                                        <td className="p-3 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                title="Xem chi tiết"
                                                onClick={() => {
                                                    // TODO: Mở modal chi tiết giao dịch
                                                    alert(
                                                        `Chi tiết giao dịch: ${transaction.transactionId}\n\n` +
                                                            `Admin: ${transaction.adminName}\n` +
                                                            `Khách sạn: ${transaction.hotelName}\n` +
                                                            `Mô tả: ${transaction.description}\n` +
                                                            `Số tiền: ${formatCurrency(transaction.amount)}\n` +
                                                            `Trạng thái: ${transaction.status}`
                                                    );
                                                }}
                                            >
                                                <FaEye />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}




