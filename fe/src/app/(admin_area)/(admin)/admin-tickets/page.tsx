"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import { getCurrentUser } from "@/lib/AdminAPI/userService";
import SupportRequestForm from "@/components/Admin/Support/SupportRequestForm";
import MySupportRequestsTable from "@/components/Admin/Support/MySupportRequestsTable";
import type { SupportRequest } from "@/types";
import { toast } from "react-toastify";

export default function AdminTicketsPage() {
    const { effectiveUser } = useAuth();
    const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUserInfo, setCurrentUserInfo] = useState<{
        fullName: string;
        email: string;
        phoneNumber?: string;
    } | null>(null);

    // Load thông tin user hiện tại
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                if (effectiveUser) {
                    setCurrentUserInfo({
                        fullName: effectiveUser.fullName,
                        email: effectiveUser.email,
                        phoneNumber: undefined, // Sẽ lấy từ API nếu cần
                    });

                    // Thử lấy thông tin đầy đủ từ API
                    try {
                        const userData = await getCurrentUser();
                        if (userData) {
                            setCurrentUserInfo({
                                fullName: userData.fullName || effectiveUser.fullName,
                                email: userData.email || effectiveUser.email,
                                phoneNumber: (userData as any).phoneNumber,
                            });
                        }
                    } catch (error) {
                        console.warn("[AdminTicketsPage] Could not load full user info:", error);
                    }
                }
            } catch (error) {
                console.error("[AdminTicketsPage] Error loading user info:", error);
            }
        };

        loadUserInfo();
    }, [effectiveUser]);

    // Load danh sách yêu cầu đã gửi
    useEffect(() => {
        const loadMyRequests = () => {
            try {
                setIsLoading(true);
                // Lấy từ localStorage - filter theo email của user hiện tại
                const allRequests = localStorage.getItem("supportRequests");
                if (allRequests && effectiveUser) {
                    const parsed = JSON.parse(allRequests);
                    // Filter chỉ lấy requests của user này
                    const myRequestsData = parsed.filter(
                        (r: any) => r.partnerEmail === effectiveUser.email
                    );
                    // Convert date strings back to Date objects
                    const requests = myRequestsData.map((r: any) => ({
                        ...r,
                        createdAt: new Date(r.createdAt),
                        resolvedAt: r.resolvedAt ? new Date(r.resolvedAt) : undefined,
                    }));
                    // Sắp xếp theo thời gian tạo (mới nhất trước)
                    requests.sort(
                        (a: SupportRequest, b: SupportRequest) =>
                            b.createdAt.getTime() - a.createdAt.getTime()
                    );
                    setMyRequests(requests);
                } else {
                    setMyRequests([]);
                }
            } catch (error) {
                console.error("[AdminTicketsPage] Error loading my requests:", error);
                setMyRequests([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadMyRequests();

        // Listen for updates
        const handleUpdate = () => {
            loadMyRequests();
        };

        window.addEventListener("supportCountUpdated", handleUpdate);

        return () => {
            window.removeEventListener("supportCountUpdated", handleUpdate);
        };
    }, [effectiveUser]);

    const handleSubmitRequest = (formData: {
        fullName: string;
        phoneNumber: string;
        address?: string;
        request: string;
        requestType: SupportRequest["requestType"];
        isHotelCreationRequest: boolean;
    }) => {
        try {
            // Tạo support request mới
            const newRequest: SupportRequest = {
                id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                partnerName: formData.fullName,
                partnerEmail: effectiveUser?.email || "",
                phoneNumber: formData.phoneNumber,
                hotelName: effectiveUser?.hotelName || "Chưa có khách sạn",
                request: formData.isHotelCreationRequest && formData.address
                    ? `[Yêu cầu tạo khách sạn]\nĐịa chỉ: ${formData.address}\n\n${formData.request}`
                    : formData.request,
                requestType: formData.requestType,
                status: "PENDING",
                priority: formData.requestType === "VIOLATION" ? "URGENT" : "HIGH",
                createdAt: new Date(),
            };

            // Lấy danh sách requests hiện tại từ localStorage
            const existingRequests = localStorage.getItem("supportRequests");
            let allRequests: any[] = [];

            if (existingRequests) {
                try {
                    allRequests = JSON.parse(existingRequests);
                } catch (e) {
                    console.error("[AdminTicketsPage] Error parsing existing requests:", e);
                }
            }

            // Thêm request mới
            allRequests.push(newRequest);

            // Lưu lại vào localStorage
            localStorage.setItem("supportRequests", JSON.stringify(allRequests));

            // Cập nhật số lượng PENDING
            const pendingCount = allRequests.filter((r) => r.status === "PENDING").length;
            localStorage.setItem("supportPendingCount", pendingCount.toString());

            // Trigger event để super admin header cập nhật
            window.dispatchEvent(new CustomEvent("supportCountUpdated"));

            // Cập nhật danh sách của tôi
            setMyRequests((prev) => [newRequest, ...prev]);

            toast.success("Gửi yêu cầu hỗ trợ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.", {
                position: "top-right",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("[AdminTicketsPage] Error submitting request:", error);
            toast.error("Không thể gửi yêu cầu. Vui lòng thử lại.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Trợ giúp</h1>
                <p className="text-gray-600">
                    Gửi yêu cầu hỗ trợ hoặc báo cáo vấn đề. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form gửi yêu cầu */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Gửi yêu cầu hỗ trợ
                        </h2>
                        <SupportRequestForm
                            currentUserInfo={currentUserInfo}
                            onSubmit={handleSubmitRequest}
                        />
                    </div>
                </div>

                {/* Danh sách yêu cầu đã gửi */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Yêu cầu của tôi
                        </h2>
                        {isLoading ? (
                            <p className="text-gray-500">Đang tải...</p>
                        ) : (
                            <MySupportRequestsTable requests={myRequests} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}



































