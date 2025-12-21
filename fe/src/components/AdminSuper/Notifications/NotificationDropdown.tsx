"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SupportRequest } from "@/types";

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    requests: SupportRequest[];
    onMarkAsRead?: (requestId: string) => void;
}

export default function NotificationDropdown({
    isOpen,
    onClose,
    requests,
    onMarkAsRead,
}: NotificationDropdownProps) {
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pendingRequests = requests.filter((r) => r.status === "PENDING");

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return "Vừa xong";
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} phút trước`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} ngày trước`;
        }

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) {
            return `${diffInWeeks} tuần trước`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths} tháng trước`;
    };

    const truncateText = (text: string, maxLength: number = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    const handleMarkAllAsRead = () => {
        if (onMarkAsRead) {
            pendingRequests.forEach((request) => {
                onMarkAsRead(request.id);
            });
        }
    };

    const handleShowAll = () => {
        onClose();
        router.push("/super-support");
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="position-absolute bg-white shadow-lg rounded"
            style={{
                top: "100%",
                right: "0",
                marginTop: "8px",
                minWidth: "420px",
                maxWidth: "500px",
                maxHeight: "600px",
                overflow: "hidden",
                zIndex: 1000,
                border: "1px solid #dee2e6",
            }}
        >
            {/* Header */}
            <div
                className="d-flex justify-content-between align-items-center px-4 py-3"
                style={{ 
                    backgroundColor: "#e7f3ff",
                    borderBottom: "1px solid #dee2e6",
                }}
            >
                <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "1rem" }}>
                    Thông báo mới
                </h6>
                <div className="d-flex align-items-center gap-2">
                    <button
                        className="btn btn-sm btn-link text-decoration-none p-0 text-primary"
                        onClick={handleMarkAllAsRead}
                        style={{ 
                            fontSize: "0.875rem",
                            fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = "none";
                        }}
                    >
                        Đánh dấu đã đọc
                    </button>
                    <span className="text-muted" style={{ fontSize: "0.875rem" }}>|</span>
                    <button
                        className="btn btn-sm btn-link text-decoration-none p-0 text-primary"
                        onClick={handleShowAll}
                        style={{ 
                            fontSize: "0.875rem",
                            fontWeight: "500",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = "none";
                        }}
                    >
                        Xem tất cả
                    </button>
                </div>
            </div>

            {/* List notifications */}
            <div style={{ maxHeight: "500px", overflowY: "auto", backgroundColor: "#f0f8ff" }}>
                {pendingRequests.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                        <p className="mb-0">Không có thông báo mới</p>
                    </div>
                ) : (
                    pendingRequests.map((request) => (
                        <div
                            key={request.id}
                            className="d-flex align-items-start px-4 py-3"
                            style={{
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                borderBottom: "1px solid #e9ecef",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#e7f3ff";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            onClick={() => {
                                onClose();
                                router.push("/super-support");
                            }}
                        >
                            {/* Avatar */}
                            <div
                                className="flex-shrink-0 me-3"
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "8px",
                                    backgroundColor: "#d1ecf1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.3rem",
                                    fontWeight: "bold",
                                    color: "#0c5460",
                                    border: "2px solid #bee5eb",
                                }}
                            >
                                {request.partnerName.charAt(0).toUpperCase()}
                            </div>

                            {/* Content */}
                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "0.95rem", lineHeight: "1.3" }}>
                                        {request.partnerName}
                                    </h6>
                                    <small className="text-muted flex-shrink-0 ms-2" style={{ fontSize: "0.8rem" }}>
                                        {formatTimeAgo(request.createdAt)}
                                    </small>
                                </div>
                                <p
                                    className="mb-0 text-dark"
                                    style={{
                                        fontSize: "0.875rem",
                                        lineHeight: "1.5",
                                        color: "#495057",
                                    }}
                                >
                                    {truncateText(request.request, 100)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

