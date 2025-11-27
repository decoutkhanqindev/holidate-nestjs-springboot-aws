"use client";

import { useState, useEffect } from "react";
import type { SupportRequest } from "@/types";

interface SupportRequestFormProps {
    currentUserInfo: {
        fullName: string;
        email: string;
        phoneNumber?: string;
    } | null;
    onSubmit: (formData: {
        fullName: string;
        phoneNumber: string;
        address?: string;
        request: string;
        requestType: SupportRequest["requestType"];
        isHotelCreationRequest: boolean;
    }) => void;
}

export default function SupportRequestForm({ currentUserInfo, onSubmit }: SupportRequestFormProps) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [request, setRequest] = useState("");
    const [requestType, setRequestType] = useState<SupportRequest["requestType"]>("TECHNICAL");
    const [isHotelCreationRequest, setIsHotelCreationRequest] = useState(false);
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load thông tin user khi component mount
    useEffect(() => {
        if (currentUserInfo) {
            setFullName(currentUserInfo.fullName || "");
            setPhoneNumber(currentUserInfo.phoneNumber || "");
        }
    }, [currentUserInfo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!fullName.trim()) {
            alert("Vui lòng nhập tên của bạn");
            return;
        }

        if (!phoneNumber.trim()) {
            alert("Vui lòng nhập số điện thoại");
            return;
        }

        // Validate phone number format (basic)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
            alert("Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số");
            return;
        }

        if (!request.trim()) {
            alert("Vui lòng nhập yêu cầu của bạn");
            return;
        }

        if (isHotelCreationRequest && !address.trim()) {
            alert("Vui lòng nhập địa chỉ khách sạn");
            return;
        }

        setIsSubmitting(true);

        try {
            onSubmit({
                fullName: fullName.trim(),
                phoneNumber: phoneNumber.trim(),
                address: isHotelCreationRequest ? address.trim() : undefined,
                request: request.trim(),
                requestType,
                isHotelCreationRequest,
            });

            // Reset form sau khi submit thành công
            setRequest("");
            setAddress("");
            setIsHotelCreationRequest(false);
        } catch (error) {
            console.error("[SupportRequestForm] Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tên */}
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Tên <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Nhập tên của bạn"
                />
            </div>

            {/* Số điện thoại */}
            <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="VD: 0123456789"
                />
            </div>

            {/* Checkbox: Yêu cầu tạo khách sạn */}
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="isHotelCreationRequest"
                    checked={isHotelCreationRequest}
                    onChange={(e) => setIsHotelCreationRequest(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isHotelCreationRequest" className="ml-2 block text-sm text-gray-700">
                    Đây là yêu cầu tạo khách sạn mới
                </label>
            </div>

            {/* Địa chỉ (chỉ hiển thị nếu là yêu cầu tạo khách sạn) */}
            {isHotelCreationRequest && (
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ khách sạn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={isHotelCreationRequest}
                        placeholder="Nhập địa chỉ đầy đủ của khách sạn"
                    />
                </div>
            )}

            {/* Loại yêu cầu */}
            <div>
                <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">
                    Loại yêu cầu <span className="text-red-500">*</span>
                </label>
                <select
                    id="requestType"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as SupportRequest["requestType"])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="TECHNICAL">Hỗ trợ kỹ thuật</option>
                    <option value="VIOLATION">Báo cáo vi phạm</option>
                    <option value="PAYMENT">Vấn đề thanh toán</option>
                    <option value="INFO_UPDATE">Cập nhật thông tin</option>
                    <option value="BUG_REPORT">Báo lỗi</option>
                    <option value="ACCOUNT">Vấn đề tài khoản</option>
                    <option value="OTHER">Khác</option>
                </select>
            </div>

            {/* Yêu cầu */}
            <div>
                <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-1">
                    Yêu cầu <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="request"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="Mô tả chi tiết yêu cầu hoặc vấn đề của bạn..."
                />
                <p className="mt-1 text-sm text-gray-500">
                    Vui lòng mô tả chi tiết để chúng tôi có thể hỗ trợ bạn tốt nhất.
                </p>
            </div>

            {/* Submit button */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </button>
            </div>
        </form>
    );
}







































