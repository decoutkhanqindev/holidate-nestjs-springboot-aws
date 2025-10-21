"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SuperAdminHeader from "./SuperAdminHeader";
// Menu cho Super Admin
const superAdminMenu = [
    { href: "/super-admin", label: "🏠 Trang chủ" },
    { href: "/super-users", label: "👤 Quản lý Super Admin" },
    { href: "/super-hotels", label: "🏨 Quản lý khách sạn" },
    { href: "/super-admins", label: "🧑‍💼 Quản lý Admin khách sạn" },
    { href: "/super-customers", label: "👥 Quản lý người dùng (khách hàng)" },
    { href: "/super-support", label: "💬 Hỗ trợ / Báo cáo vi phạm" },
    { href: "/super-news", label: "📢 Tin tức & thông báo" },
    { href: "/super-payment", label: "💸 Quản lý giao dịch / thanh toán" },
    { href: "/super-revenue", label: "📊 Báo cáo doanh thu" },
    { href: "/super-booking-stat", label: "📈 Thống kê đặt phòng" },
    { href: "/super-setting", label: "⚙️ Cài đặt chung" },
    { href: "/super-policy", label: "🧾 Chính sách & quy định" },
    { href: "/super-language", label: "🌐 Quản lý ngôn ngữ / giao diện" },
];

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#f7f9fb" }}>
            {/* Sidebar */}
            <aside style={{
                width: 260,
                background: "#222e3c",
                color: "#fff",
                minHeight: "100vh",
                boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
                paddingTop: 24,
                position: "sticky",
                top: 0
            }}>
                <div style={{ fontWeight: 700, fontSize: 20, letterSpacing: 1, padding: "0 24px 16px 24px" }}>
                    <span style={{ color: "#4fd1c5" }}>Super Admin</span>
                </div>
                <ul className="nav flex-column" style={{ gap: 2 }}>
                    {superAdminMenu.map(item => (
                        <li key={item.href} className="nav-item mb-1">
                            <Link
                                href={item.href}
                                className={`nav-link d-flex flex-column px-4 py-2 rounded-2 ${pathname === item.href ? "bg-info text-dark fw-bold" : "text-white"}`}
                                style={{ fontSize: 16, transition: "background-color 0.2s" }}
                            >
                                <span>{item.label}</span>
                                {/* <span className="small text-secondary">{item.desc}</span> */}
                            </Link>
                        </li>
                    ))}
                </ul>
            </aside>
            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 3. Thêm Header vào đây */}
                <SuperAdminHeader />
                <main style={{ flex: 1, minHeight: "100vh", padding: "32px 24px" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}