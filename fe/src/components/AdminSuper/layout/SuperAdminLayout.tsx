// file: app/(admin_area)/(super_admin)/layout.tsx
"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
import SuperAdminHeader from "@/components/AdminSuper/layout/SuperAdminHeader";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaHome, FaUsersCog, FaBuilding, FaUserShield, FaUsers, FaLifeRing,
    FaNewspaper, FaCreditCard, FaChartPie, FaChartBar, FaCog, FaFileContract, FaGlobe
} from "react-icons/fa";

const superAdminMenu = [
    { href: "/super-admin", label: "Trang chủ", icon: FaHome },
    { href: "/super-user-management", label: "Quản lý  Admin Khách sạn", icon: FaUsersCog },
    { href: "/super-hotels", label: "Quản lý khách sạn", icon: FaBuilding },
    // { href: "/super-admins", label: "Quản lý Admin khách sạn", icon: FaUserShield },
    { href: "/super-customers", label: "Quản lý người dùng", icon: FaUsers },
    { href: "/super-support", label: "Hỗ trợ / Báo cáo vi phạm", icon: FaLifeRing },
    { href: "/super-news", label: "Tin tức & thông báo", icon: FaNewspaper },
    { href: "/super-payment", label: "Quản lý giao dịch", icon: FaCreditCard },
    { href: "/super-revenue", label: "Báo cáo doanh thu", icon: FaChartPie },
    { href: "/super-booking-stat", label: "Thống kê đặt phòng", icon: FaChartBar },
    { href: "/super-setting", label: "Cài đặt chung", icon: FaCog },
    { href: "/super-policy", label: "Chính sách & quy định", icon: FaFileContract },
];


export default function SuperAdminAreaLayout({ children }: { children: ReactNode }) {
    const { isLoading, effectiveUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        if (!isLoading) {
            if (!effectiveUser || effectiveUser.role !== 'SUPER_ADMIN') {
                router.push('/admin-login');
            }
        }
    }, [isLoading, effectiveUser, router]);

    if (isLoading || !effectiveUser || effectiveUser.role !== 'SUPER_ADMIN') {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                Đang tải và xác thực quyền...
            </div>
        );
    }

    return (
        <div className="d-flex vh-100 bg-light overflow-hidden">
            {/* Sidebar */}
            <aside
                className="bg-dark text-white d-flex flex-column shadow"
                style={{
                    width: isCollapsed ? '80px' : '260px',
                    transition: 'width 0.3s ease-in-out',
                    position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
                }}
            >
                <div className="d-flex align-items-center justify-content-center border-bottom" style={{ height: '70px', flexShrink: 0 }}>
                    <Link href="/super-admin" className="h4 m-0 text-info text-decoration-none fw-bold">
                        {isCollapsed ? 'SA' : 'SuperPanel'}
                    </Link>
                </div>
                <nav className="flex-grow-1 p-2 mt-2 overflow-auto">
                    <ul className="nav flex-column gap-1">
                        {superAdminMenu.map(item => {
                            const isActive = pathname.startsWith(item.href);
                            const Icon = item.icon; // Lấy component Icon
                            return (
                                <li key={item.href} className="nav-item">
                                    <Link
                                        href={item.href}
                                        className={`nav-link d-flex align-items-center rounded-3 p-3 ${isActive ? "bg-info text-dark fw-semibold" : "text-white"}`}
                                        title={isCollapsed ? item.label : ""}
                                        style={{
                                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                                            gap: isCollapsed ? 0 : '1rem',
                                        }}
                                    >
                                        {/* Render Icon ở đây */}
                                        <Icon size={isCollapsed ? 22 : 20} />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </aside>

            {/* Nội dung chính */}
            <div
                className="flex-grow-1 d-flex flex-column"
                style={{
                    marginLeft: isCollapsed ? '80px' : '260px',
                    transition: 'margin-left 0.3s ease-in-out',
                }}
            >
                <SuperAdminHeader onToggleSidebar={toggleSidebar} />
                <main className="flex-grow-1 p-4 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}