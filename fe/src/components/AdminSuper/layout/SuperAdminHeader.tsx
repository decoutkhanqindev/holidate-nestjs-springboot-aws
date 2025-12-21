// file: SuperAdminHeader.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { useRouter } from "next/navigation";
// Sử dụng icon từ thư viện bạn có: react-icons/fa
import { FaBars, FaBell } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { useSupportNotifications } from "@/hooks/useSupportNotifications";
import NotificationDropdown from "@/components/AdminSuper/Notifications/NotificationDropdown";
import type { SupportRequest } from "@/types";

interface SuperAdminHeaderProps {
    onToggleSidebar: () => void;
}

export default function SuperAdminHeader({ onToggleSidebar }: SuperAdminHeaderProps) {
    const { effectiveUser, logout } = useAuth();
    const router = useRouter();
    const { pendingCount, isLoading } = useSupportNotifications();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
    const displayName = effectiveUser?.email ? effectiveUser.email.split('@')[0] : 'Super Admin';

    // Load support requests để hiển thị trong dropdown
    useEffect(() => {
        const loadSupportRequests = () => {
            try {
                // TODO: Thay bằng API call khi có backend
                // Hiện tại lấy từ localStorage hoặc mock data
                const storedRequests = localStorage.getItem("supportRequests");
                if (storedRequests) {
                    const parsed = JSON.parse(storedRequests);
                    // Convert date strings back to Date objects
                    const requests = parsed.map((r: any) => ({
                        ...r,
                        createdAt: new Date(r.createdAt),
                        resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
                    }));
                    setSupportRequests(requests);
                } else {
                    // Mock data - chỉ lấy PENDING
                    const mockRequests: SupportRequest[] = [
                        {
                            id: "1",
                            partnerName: "Nguyễn Văn A",
                            partnerEmail: "admin1@hotel.com",
                            phoneNumber: "0123456789",
                            hotelName: "Hoang Ngoc Beach Resort",
                            request: "Yêu cầu hỗ trợ kỹ thuật: Hệ thống đặt phòng không hoạt động đúng. Khách hàng không thể đặt phòng qua website.",
                            requestType: "TECHNICAL",
                            status: "PENDING",
                            createdAt: new Date("2025-01-20T09:30:00"),
                            priority: "HIGH",
                        },
                        {
                            id: "4",
                            partnerName: "Phạm Thị D",
                            partnerEmail: "admin4@hotel.com",
                            phoneNumber: "0923456789",
                            hotelName: "Mountain Peak Resort",
                            request: "Yêu cầu hỗ trợ thanh toán: Giao dịch thanh toán phí dịch vụ bị lỗi, không nhận được xác nhận từ hệ thống.",
                            requestType: "PAYMENT",
                            status: "PENDING",
                            createdAt: new Date("2025-01-20T11:45:00"),
                            priority: "HIGH",
                        },
                        {
                            id: "5",
                            partnerName: "Hoàng Văn E",
                            partnerEmail: "admin5@hotel.com",
                            phoneNumber: "0934567890",
                            hotelName: "City Center Hotel",
                            request: "Báo cáo lỗi: Hình ảnh phòng không hiển thị đúng trên trang chi tiết phòng. Cần kiểm tra và sửa lỗi.",
                            requestType: "BUG_REPORT",
                            status: "PENDING",
                            createdAt: new Date("2025-01-20T08:00:00"),
                            priority: "MEDIUM",
                        },
                    ];
                    setSupportRequests(mockRequests);
                    localStorage.setItem("supportRequests", JSON.stringify(mockRequests));
                }
            } catch (error) {
            }
        };

        loadSupportRequests();

        // Listen for updates
        const handleUpdate = () => {
            loadSupportRequests();
        };

        window.addEventListener("supportCountUpdated", handleUpdate);

        return () => {
            window.removeEventListener("supportCountUpdated", handleUpdate);
        };
    }, []);

    const handleMarkAsRead = (requestId: string) => {
        // TODO: Gọi API để đánh dấu đã đọc
        // Hiện tại chỉ cập nhật local state
        setSupportRequests((prev) => {
            const updated = prev.map((r) =>
                r.id === requestId ? { ...r, status: "IN_PROGRESS" as const } : r
            );

            // Cập nhật localStorage
            localStorage.setItem("supportRequests", JSON.stringify(updated));

            // Trigger event để cập nhật count
            const pendingCount = updated.filter((r) => r.status === "PENDING").length;
            localStorage.setItem("supportPendingCount", pendingCount.toString());
            window.dispatchEvent(new CustomEvent("supportCountUpdated"));

            return updated;
        });
    };

    return (
        // Dùng Bootstrap và inline-style như code cũ của bạn
        <header className="bg-white shadow-sm d-flex justify-content-between align-items-center px-4" style={{ height: '70px', position: 'sticky', top: 0, zIndex: 99 }}>
            <div className="d-flex align-items-center gap-3">
                <button
                    onClick={onToggleSidebar}
                    className="btn btn-outline-secondary border-0"
                >
                    <FaBars size={20} />
                </button>
                <h5 className="m-0 fw-semibold text-dark"> Admin Dashboard</h5>
            </div>
            <div className="d-flex align-items-center gap-3">
                {/* Icon chuông thông báo với dropdown */}
                <div className="position-relative">
                    <button
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        className="btn btn-outline-secondary border-0 position-relative"
                        style={{ padding: "8px 12px" }}
                        title="Yêu cầu hỗ trợ / Báo cáo vi phạm"
                    >
                        <FaBell size={20} className="text-dark" />
                        {!isLoading && pendingCount > 0 && (
                            <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{
                                    fontSize: "0.7rem",
                                    padding: "2px 6px",
                                    minWidth: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {pendingCount > 99 ? "99+" : pendingCount}
                            </span>
                        )}
                    </button>
                    <NotificationDropdown
                        isOpen={isNotificationOpen}
                        onClose={() => setIsNotificationOpen(false)}
                        requests={supportRequests}
                        onMarkAsRead={handleMarkAsRead}
                    />
                </div>
                <span className="text-secondary">
                    Chào, <strong className="text-primary">{displayName}!</strong>
                </span>
                <button
                    onClick={logout}
                    className="btn btn-outline-danger d-flex align-items-center gap-2"
                >
                    <IoLogOutOutline size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </header>
    );
}