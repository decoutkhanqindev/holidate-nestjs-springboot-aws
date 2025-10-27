// file: layout.tsx

"use client";
import { ReactNode, useEffect, useState } from "react"; // << THÊM useState
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import AdminHeader from "@/components/Admin/layout/AdminHeader";
import AdminSidebar from "@/components/Admin/layout/AdminSidebar";
import ImpersonationBanner from "@/components/Admin/ImpersonationBanner";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { isLoading, effectiveUser } = useAuth();
    const router = useRouter();

    // --- BẮT ĐẦU THAY ĐỔI ---
    // 1. Nâng state lên layout cha
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!isSidebarCollapsed);
    };
    // --- KẾT THÚC THAY ĐỔI ---

    useEffect(() => {
        if (!isLoading) {
            if (!effectiveUser || effectiveUser.role !== "HOTEL_ADMIN") {
                router.push("/admin-login");
            }
        }
    }, [isLoading, effectiveUser, router]);

    if (isLoading || !effectiveUser || effectiveUser.role !== "HOTEL_ADMIN") {
        return (
            <div className="flex items-center justify-center h-screen">
                Đang tải và xác thực quyền...
            </div>
        );
    }

    // --- BẮT ĐẦU THAY ĐỔI CẤU TRÚC GIAO DIỆN ---
    return (
        <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
            {/* Sidebar giờ đây nhận state từ layout cha */}
            <AdminSidebar isCollapsed={isSidebarCollapsed} />

            {/* Nội dung chính, margin-left sẽ thay đổi theo state */}
            <div
                className={`
                    flex flex-col flex-1 h-full transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed ? 'ml-20' : 'ml-[250px]'}
                `}
            >
                {/* Header giờ đây nhận hàm toggle từ layout cha */}
                <header
                    className={`
                        fixed top-0 right-0 h-[70px] bg-white shadow z-40
                        transition-all duration-300 ease-in-out
                        ${isSidebarCollapsed ? 'left-20' : 'left-[250px]'}
                    `}
                >
                    <AdminHeader onToggleSidebar={toggleSidebar} />
                </header>

                <main className="flex-1 overflow-y-auto mt-[70px] p-6">
                    <ImpersonationBanner />
                    {children}
                </main>
            </div>
        </div>
    );
    // --- KẾT THÚC THAY ĐỔI CẤU TRÚC GIAO DIỆN ---
}