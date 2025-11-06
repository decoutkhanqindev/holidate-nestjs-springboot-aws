// hooks/useSupportNotifications.ts
import { useState, useEffect } from "react";
import type { SupportRequest } from "@/types";

/**
 * Hook để lấy số lượng yêu cầu hỗ trợ chưa xử lý (PENDING)
 * Hiện tại dùng mock data, sau này sẽ thay bằng API call
 */
export function useSupportNotifications() {
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Thay bằng API call khi có backend
        // Hiện tại tính từ localStorage hoặc mock data
        const loadPendingCount = () => {
            try {
                // Lấy từ localStorage nếu có (được lưu từ support page)
                const storedCount = localStorage.getItem("supportPendingCount");
                if (storedCount) {
                    setPendingCount(parseInt(storedCount, 10));
                } else {
                    // Mock data - đếm số yêu cầu PENDING
                    // Trong thực tế, sẽ gọi API: GET /support-requests?status=PENDING
                    const mockPendingCount = 3; // Hardcode tạm thời
                    setPendingCount(mockPendingCount);
                    localStorage.setItem("supportPendingCount", mockPendingCount.toString());
                }
            } catch (error) {
                console.error("[useSupportNotifications] Error loading count:", error);
                setPendingCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadPendingCount();

        // Listen for storage changes (khi support page cập nhật từ tab/window khác)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "supportPendingCount") {
                setPendingCount(parseInt(e.newValue || "0", 10));
            }
        };

        // Listen for custom event (khi support page cập nhật từ cùng window)
        const handleCustomStorageChange = () => {
            loadPendingCount();
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("supportCountUpdated", handleCustomStorageChange);

        // Polling để cập nhật số lượng (mỗi 30 giây)
        const interval = setInterval(loadPendingCount, 30000);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("supportCountUpdated", handleCustomStorageChange);
            clearInterval(interval);
        };
    }, []);

    return { pendingCount, isLoading };
}

