"use client";

import type { SupportRequest } from "@/types";
import { FaEye, FaClock, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

interface SupportRequestsTableProps {
    requests: SupportRequest[];
    onStatusChange?: (requestId: string, newStatus: SupportRequest["status"]) => void;
}

// Component Status Badge
function StatusBadge({ status }: { status: SupportRequest["status"] }) {
    const statusConfig: Record<
        SupportRequest["status"],
        { label: string; className: string; icon: React.ReactNode }
    > = {
        PENDING: {
            label: "Chờ xử lý",
            className: "bg-warning-subtle text-warning-emphasis",
            icon: <FaClock className="me-1" />,
        },
        IN_PROGRESS: {
            label: "Đang xử lý",
            className: "bg-info-subtle text-info-emphasis",
            icon: <FaSpinner className="me-1" />,
        },
        RESOLVED: {
            label: "Đã giải quyết",
            className: "bg-success-subtle text-success-emphasis",
            icon: <FaCheckCircle className="me-1" />,
        },
        CLOSED: {
            label: "Đã đóng",
            className: "bg-secondary-subtle text-secondary-emphasis",
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

// Component Priority Badge
function PriorityBadge({ priority }: { priority: SupportRequest["priority"] }) {
    const priorityConfig: Record<
        SupportRequest["priority"],
        { label: string; className: string }
    > = {
        LOW: {
            label: "Thấp",
            className: "bg-secondary-subtle text-secondary-emphasis",
        },
        MEDIUM: {
            label: "Trung bình",
            className: "bg-info-subtle text-info-emphasis",
        },
        HIGH: {
            label: "Cao",
            className: "bg-warning-subtle text-warning-emphasis",
        },
        URGENT: {
            label: "Khẩn cấp",
            className: "bg-danger-subtle text-danger-emphasis",
        },
    };

    const config = priorityConfig[priority] || priorityConfig.MEDIUM;

    return (
        <span className={`badge ${config.className}`}>
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
            className: "bg-primary-subtle text-primary-emphasis",
        },
        VIOLATION: {
            label: "Vi phạm",
            className: "bg-danger-subtle text-danger-emphasis",
        },
        PAYMENT: {
            label: "Thanh toán",
            className: "bg-success-subtle text-success-emphasis",
        },
        INFO_UPDATE: {
            label: "Cập nhật",
            className: "bg-info-subtle text-info-emphasis",
        },
        BUG_REPORT: {
            label: "Báo lỗi",
            className: "bg-warning-subtle text-warning-emphasis",
        },
        ACCOUNT: {
            label: "Tài khoản",
            className: "bg-secondary-subtle text-secondary-emphasis",
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

export default function SupportRequestsTable({ requests, onStatusChange }: SupportRequestsTableProps) {
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
            <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                    <p className="text-muted mb-0">Không tìm thấy yêu cầu nào</p>
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
                                <th scope="col" className="p-3" style={{ width: "15%" }}>
                                    Tên chủ khách sạn
                                </th>
                                <th scope="col" className="p-3" style={{ width: "12%" }}>
                                    Số điện thoại
                                </th>
                                <th scope="col" className="p-3" style={{ width: "15%" }}>
                                    Khách sạn
                                </th>
                                <th scope="col" className="p-3" style={{ width: "25%" }}>
                                    Yêu cầu
                                </th>
                                <th scope="col" className="p-3" style={{ width: "10%" }}>
                                    Loại
                                </th>
                                <th scope="col" className="p-3" style={{ width: "8%" }}>
                                    Độ ưu tiên
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
                            {requests.map((request, index) => (
                                <tr key={request.id}>
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3">
                                        <div>
                                            <div className="fw-medium text-dark">
                                                {request.partnerName}
                                            </div>
                                            <small className="text-muted">
                                                {request.partnerEmail}
                                            </small>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <a
                                            href={`tel:${request.phoneNumber}`}
                                            className="text-decoration-none"
                                        >
                                            {request.phoneNumber}
                                        </a>
                                    </td>
                                    <td className="p-3">
                                        <div className="fw-medium text-dark">
                                            {request.hotelName}
                                        </div>
                                    </td>
                                    <td className="p-3">
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
                                            {truncateText(request.request, 80)}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <RequestTypeBadge type={request.requestType} />
                                    </td>
                                    <td className="p-3">
                                        <PriorityBadge priority={request.priority} />
                                    </td>
                                    <td className="p-3">
                                        <select
                                            className="form-select form-select-sm"
                                            value={request.status}
                                            onChange={(e) => {
                                                const newStatus = e.target.value as SupportRequest["status"];
                                                if (onStatusChange) {
                                                    onStatusChange(request.id, newStatus);
                                                }
                                            }}
                                            style={{
                                                minWidth: "140px",
                                                fontSize: "0.875rem",
                                                ...(request.status === "PENDING" && {
                                                    backgroundColor: "#fcf8e3",
                                                    color: "#8a6d3b",
                                                    borderColor: "#fcf8e3",
                                                }),
                                                ...(request.status === "IN_PROGRESS" && {
                                                    backgroundColor: "#d9edf7",
                                                    color: "#31708f",
                                                    borderColor: "#d9edf7",
                                                }),
                                                ...(request.status === "RESOLVED" && {
                                                    backgroundColor: "#dff0d8",
                                                    color: "#3c763d",
                                                    borderColor: "#dff0d8",
                                                }),
                                                ...(request.status === "CLOSED" && {
                                                    backgroundColor: "#e2e3e5",
                                                    color: "#383d41",
                                                    borderColor: "#e2e3e5",
                                                }),
                                            }}
                                        >
                                            <option value="PENDING">Chờ xử lý</option>
                                            <option value="IN_PROGRESS">Đang xử lý</option>
                                            <option value="RESOLVED">Đã giải quyết</option>
                                            <option value="CLOSED">Đã đóng</option>
                                        </select>
                                    </td>
                                    <td className="p-3 text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            title="Xem chi tiết"
                                            onClick={() => {
                                                // TODO: Mở modal chi tiết yêu cầu
                                                const details = `
Chi tiết yêu cầu hỗ trợ:

ID: ${request.id}
Chủ khách sạn: ${request.partnerName}
Email: ${request.partnerEmail}
Số điện thoại: ${request.phoneNumber}
Khách sạn: ${request.hotelName}
Loại: ${request.requestType}
Độ ưu tiên: ${request.priority}
Trạng thái: ${request.status}
Thời gian tạo: ${formatDate(request.createdAt)}
${request.resolvedAt ? `Thời gian giải quyết: ${formatDate(request.resolvedAt)}` : ''}

Yêu cầu:
${request.request}
                                                `.trim();
                                                alert(details);
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

