"use client";

import type { PaymentTransaction } from "@/types";
import { FaEye, FaCheckCircle, FaClock, FaExclamationTriangle, FaTimesCircle, FaUndo } from "react-icons/fa";

interface PaymentTransactionsTableProps {
    transactions: PaymentTransaction[];
}

// Component Status Badge
function StatusBadge({ status }: { status: PaymentTransaction["status"] }) {
    const statusConfig: Record<
        PaymentTransaction["status"],
        { label: string; className: string; icon: React.ReactNode }
    > = {
        success: {
            label: "Thành công",
            className: "bg-success-subtle text-success-emphasis",
            icon: <FaCheckCircle className="me-1" />,
        },
        pending: {
            label: "Đang chờ",
            className: "bg-warning-subtle text-warning-emphasis",
            icon: <FaClock className="me-1" />,
        },
        failed: {
            label: "Thất bại",
            className: "bg-danger-subtle text-danger-emphasis",
            icon: <FaTimesCircle className="me-1" />,
        },
        refunded: {
            label: "Đã hoàn tiền",
            className: "bg-info-subtle text-info-emphasis",
            icon: <FaUndo className="me-1" />,
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`badge ${config.className} d-flex align-items-center`} style={{ width: "fit-content" }}>
            {config.icon}
            {config.label}
        </span>
    );
}

export default function PaymentTransactionsTable({ transactions }: PaymentTransactionsTableProps) {
    const formatDate = (date: Date | null | undefined) => {
        if (!date) return '-';
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
                                <th scope="col" className="p-3 text-left" style={{ width: "4%", minWidth: "50px" }}>
                                    STT
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "10%", minWidth: "120px" }}>
                                    Mã GD
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "10%", minWidth: "120px" }}>
                                    Mã đơn
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "12%", minWidth: "150px" }}>
                                    Khách hàng
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "12%", minWidth: "150px" }}>
                                    Khách sạn
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "10%", minWidth: "120px" }}>
                                    Số tiền
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "8%", minWidth: "100px" }}>
                                    Thanh toán
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "8%", minWidth: "100px" }}>
                                    Trạng thái
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "10%", minWidth: "140px" }}>
                                    Ngày thanh toán
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "10%", minWidth: "140px" }}>
                                    Ngày tạo
                                </th>
                                <th scope="col" className="p-3 text-left" style={{ width: "8%", minWidth: "100px" }}>
                                    Loại thanh toán
                                </th>
                                <th scope="col" className="p-3 text-center" style={{ width: "6%", minWidth: "80px" }}>
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr key={transaction.transaction_id}>
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <code className="text-primary small" style={{ fontSize: '0.75rem' }}>
                                            {transaction.transaction_id.substring(0, 8).toUpperCase()}
                                        </code>
                                    </td>
                                    <td className="p-3">
                                        <code className="text-info small" style={{ fontSize: '0.75rem' }}>
                                            {transaction.booking_id.substring(0, 8).toUpperCase()}
                                        </code>
                                    </td>
                                    <td className="p-3">
                                        <div>
                                            <div className="fw-medium text-dark">
                                                {transaction.user_name || 'N/A'}
                                            </div>
                                            {transaction.user_email && (
                                                <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                                                    {transaction.user_email}
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="fw-medium text-dark">
                                            {transaction.hotel_name || transaction.hotel_id.substring(0, 8).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="fw-semibold text-dark">
                                            {formatCurrency(transaction.final_amount)}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="badge bg-info-subtle text-info-emphasis">
                                            {transaction.payment_method}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <StatusBadge status={transaction.status} />
                                    </td>
                                    <td className="p-3">
                                        <div className="small">
                                            {transaction.paid_at ? (
                                                <span className="text-success">
                                                    {formatDate(transaction.paid_at)}
                                                </span>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="small">
                                            {formatDate(transaction.created_at)}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <span className="badge bg-primary-subtle text-primary-emphasis">
                                            {transaction.payment_gateway}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            title="Xem chi tiết"
                                            onClick={() => {
                                                alert(
                                                    `Chi tiết giao dịch:\n\n` +
                                                    `Mã giao dịch: ${transaction.transaction_id}\n` +
                                                    `Mã đặt phòng: ${transaction.booking_id}\n` +
                                                    `Khách hàng: ${transaction.user_name || transaction.user_id}\n` +
                                                    `Email: ${transaction.user_email || '-'}\n` +
                                                    `Khách sạn: ${transaction.hotel_name || transaction.hotel_id}\n` +
                                                    `Số tiền: ${formatCurrency(transaction.amount)}\n` +
                                                    `Giảm giá: ${formatCurrency(transaction.discount_amount)}\n` +
                                                    `Tổng tiền: ${formatCurrency(transaction.final_amount)}\n` +
                                                    `Phương thức: ${transaction.payment_method}\n` +
                                                    `Cổng thanh toán: ${transaction.payment_gateway}\n` +
                                                    `Trạng thái: ${transaction.status}\n` +
                                                    `Ngày tạo: ${formatDate(transaction.created_at)}\n` +
                                                    `Ngày thanh toán: ${transaction.paid_at ? formatDate(transaction.paid_at) : '-'}\n` +
                                                    `Ngày hoàn tiền: ${transaction.refunded_at ? formatDate(transaction.refunded_at) : '-'}`
                                                );
                                            }}
                                        >
                                            <FaEye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
