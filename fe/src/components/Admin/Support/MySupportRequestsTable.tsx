"use client";

import type { SupportRequest } from "@/types";
import { FaClock, FaSpinner, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

interface MySupportRequestsTableProps {
    requests: SupportRequest[];
}

// Component Status Badge
function StatusBadge({ status }: { status: SupportRequest["status"] }) {
    const statusConfig: Record<
        SupportRequest["status"],
        { label: string; className: string; icon: React.ReactNode }
    > = {
        PENDING: {
            label: "Chờ xử lý",
            className: "bg-warning text-white",
            icon: <FaClock className="me-1" />,
        },
        IN_PROGRESS: {
            label: "Đang xử lý",
            className: "bg-info text-white",
            icon: <FaSpinner className="me-1" />,
        },
        RESOLVED: {
            label: "Đã giải quyết",
            className: "bg-success text-white",
            icon: <FaCheckCircle className="me-1" />,
        },
        CLOSED: {
            label: "Đã đóng",
            className: "bg-secondary text-white",
            icon: <FaTimesCircle className="me-1" />,
        },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
        <span className={`badge ${config.className} d-inline-flex align-items-center`} style={{ width: "fit-content" }}>
            {config.icon}
            {config.label}
        </span>
    );
}

// Component Request Type Badge
function RequestTypeBadge({ type }: { type: SupportRequest["requestType"] }) {
    const typeConfig: Record<
        SupportRequest["requestType"],
        { label: string; className: string }
    > = {
        TECHNICAL: {
            label: "Kỹ thuật",
            className: "bg-primary text-white",
        },
        VIOLATION: {
            label: "Vi phạm",
            className: "bg-danger text-white",
        },
        PAYMENT: {
            label: "Thanh toán",
            className: "bg-success text-white",
        },
        INFO_UPDATE: {
            label: "Cập nhật",
            className: "bg-info text-white",
        },
        BUG_REPORT: {
            label: "Báo lỗi",
            className: "bg-warning text-white",
        },
        ACCOUNT: {
            label: "Tài khoản",
            className: "bg-secondary text-white",
        },
        OTHER: {
            label: "Khác",
            className: "bg-light text-dark",
        },
    };

    const config = typeConfig[type] || typeConfig.OTHER;

    return (
        <span className={`badge ${config.className}`}>
            {config.label}
        </span>
    );
}

export default function MySupportRequestsTable({ requests }: MySupportRequestsTableProps) {
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-8 text-muted">
                <p className="mb-0">Bạn chưa gửi yêu cầu nào</p>
                <p className="small mt-2">Gửi yêu cầu hỗ trợ đầu tiên của bạn ở form bên cạnh</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th scope="col" className="p-2" style={{ width: "5%" }}>
                            STT
                        </th>
                        <th scope="col" className="p-2" style={{ width: "15%" }}>
                            Loại
                        </th>
                        <th scope="col" className="p-2" style={{ width: "40%" }}>
                            Yêu cầu
                        </th>
                        <th scope="col" className="p-2" style={{ width: "15%" }}>
                            Thời gian
                        </th>
                        <th scope="col" className="p-2" style={{ width: "15%" }}>
                            Trạng thái
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((request, index) => (
                        <tr key={request.id}>
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">
                                <RequestTypeBadge type={request.requestType} />
                            </td>
                            <td className="p-2">
                                <div
                                    className="small"
                                    title={request.request}
                                    style={{
                                        maxWidth: "300px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {truncateText(request.request, 60)}
                                </div>
                            </td>
                            <td className="p-2">
                                <small className="text-muted">
                                    {formatDate(request.createdAt)}
                                </small>
                            </td>
                            <td className="p-2">
                                <StatusBadge status={request.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

