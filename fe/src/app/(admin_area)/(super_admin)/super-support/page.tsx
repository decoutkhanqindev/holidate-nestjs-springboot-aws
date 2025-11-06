"use client";

import { useState, useEffect } from "react";
import SupportRequestsTable from "@/components/AdminSuper/Support/SupportRequestsTable";
import type { SupportRequest } from "@/types";

// Dữ liệu hardcode - sẽ thay thế bằng API sau
const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
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
        id: "2",
        partnerName: "Trần Thị B",
        partnerEmail: "admin2@hotel.com",
        phoneNumber: "0987654321",
        hotelName: "Sunset Hotel & Resort",
        request: "Báo cáo vi phạm: Khách hàng đã hủy đặt phòng nhưng hệ thống vẫn tính phí. Yêu cầu kiểm tra và hoàn tiền.",
        requestType: "VIOLATION",
        status: "IN_PROGRESS",
        createdAt: new Date("2025-01-19T14:20:00"),
        priority: "URGENT",
    },
    {
        id: "3",
        partnerName: "Lê Văn C",
        partnerEmail: "admin3@hotel.com",
        phoneNumber: "0912345678",
        hotelName: "Ocean View Hotel",
        request: "Yêu cầu cập nhật thông tin: Cần thay đổi địa chỉ khách sạn và thông tin liên hệ trên hệ thống.",
        requestType: "INFO_UPDATE",
        status: "RESOLVED",
        createdAt: new Date("2025-01-18T10:15:00"),
        resolvedAt: new Date("2025-01-19T16:00:00"),
        priority: "MEDIUM",
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
    {
        id: "6",
        partnerName: "Võ Thị F",
        partnerEmail: "admin6@hotel.com",
        phoneNumber: "0945678901",
        hotelName: "Riverside Hotel",
        request: "Yêu cầu hỗ trợ: Không thể đăng nhập vào tài khoản admin. Quên mật khẩu và cần reset.",
        requestType: "ACCOUNT",
        status: "RESOLVED",
        createdAt: new Date("2025-01-17T13:30:00"),
        resolvedAt: new Date("2025-01-17T15:00:00"),
        priority: "HIGH",
    },
];

export default function SuperSupportPage() {
    const [requests, setRequests] = useState<SupportRequest[]>(MOCK_SUPPORT_REQUESTS);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [filterType, setFilterType] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Cập nhật số lượng PENDING vào localStorage khi component mount hoặc requests thay đổi
    useEffect(() => {
        const pendingCount = requests.filter((r) => r.status === "PENDING").length;
        localStorage.setItem("supportPendingCount", pendingCount.toString());
        // Lưu toàn bộ requests để header có thể hiển thị trong dropdown
        localStorage.setItem("supportRequests", JSON.stringify(requests));
        // Trigger custom event để header có thể cập nhật ngay lập tức
        window.dispatchEvent(new CustomEvent("supportCountUpdated"));
    }, [requests]);

    // Handler để cập nhật trạng thái
    const handleStatusChange = (requestId: string, newStatus: SupportRequest["status"]) => {
        setRequests((prevRequests) => {
            const updatedRequests = prevRequests.map((request) => {
                if (request.id === requestId) {
                    const updatedRequest = { ...request, status: newStatus };
                    // Nếu chuyển sang RESOLVED, thêm resolvedAt
                    if (newStatus === "RESOLVED" && !updatedRequest.resolvedAt) {
                        updatedRequest.resolvedAt = new Date();
                    }
                    return updatedRequest;
                }
                return request;
            });

            // Cập nhật số lượng PENDING vào localStorage để header có thể đọc
            const pendingCount = updatedRequests.filter((r) => r.status === "PENDING").length;
            localStorage.setItem("supportPendingCount", pendingCount.toString());
            
            // Trigger custom event để header có thể cập nhật ngay lập tức
            window.dispatchEvent(new CustomEvent("supportCountUpdated"));

            return updatedRequests;
        });
    };

    // Filter requests
    const filteredRequests = requests.filter((request) => {
        const matchesStatus = filterStatus === "ALL" || request.status === filterStatus;
        const matchesType = filterType === "ALL" || request.requestType === filterType;
        const matchesSearch =
            searchQuery === "" ||
            request.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.phoneNumber.includes(searchQuery) ||
            request.request.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 text-dark mb-0">Hỗ trợ / Báo cáo vi phạm</h1>
                <div className="text-muted small">
                    <span className="badge bg-info">Dữ liệu mẫu</span>
                </div>
            </div>

            {/* Filter và Search */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label htmlFor="search" className="form-label">
                                Tìm kiếm
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="search"
                                placeholder="Tìm theo tên, khách sạn, SĐT, yêu cầu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
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
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="IN_PROGRESS">Đang xử lý</option>
                                <option value="RESOLVED">Đã giải quyết</option>
                                <option value="CLOSED">Đã đóng</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label htmlFor="typeFilter" className="form-label">
                                Lọc theo loại
                            </label>
                            <select
                                className="form-select"
                                id="typeFilter"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">Tất cả</option>
                                <option value="TECHNICAL">Hỗ trợ kỹ thuật</option>
                                <option value="VIOLATION">Báo cáo vi phạm</option>
                                <option value="PAYMENT">Thanh toán</option>
                                <option value="INFO_UPDATE">Cập nhật thông tin</option>
                                <option value="BUG_REPORT">Báo lỗi</option>
                                <option value="ACCOUNT">Tài khoản</option>
                                <option value="OTHER">Khác</option>
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterStatus("ALL");
                                    setFilterType("ALL");
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
                            <h6 className="card-subtitle mb-2 text-muted">Tổng yêu cầu</h6>
                            <h4 className="card-title text-primary mb-0">
                                {requests.length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-warning">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Chờ xử lý</h6>
                            <h4 className="card-title text-warning mb-0">
                                {requests.filter((r) => r.status === "PENDING").length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-info">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Đang xử lý</h6>
                            <h4 className="card-title text-info mb-0">
                                {requests.filter((r) => r.status === "IN_PROGRESS").length}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-success">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Đã giải quyết</h6>
                            <h4 className="card-title text-success mb-0">
                                {requests.filter((r) => r.status === "RESOLVED").length}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bảng yêu cầu hỗ trợ */}
            <SupportRequestsTable requests={filteredRequests} onStatusChange={handleStatusChange} />
        </div>
    );
}

