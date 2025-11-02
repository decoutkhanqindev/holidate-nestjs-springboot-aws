// file: SuperAdminHeader.tsx
"use client";

import { useAuth } from "@/components/Admin/AuthContext_Admin/AuthContextAdmin";
// Sử dụng icon từ thư viện bạn có: react-icons/fa
import { FaBars } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";

interface SuperAdminHeaderProps {
    onToggleSidebar: () => void;
}

export default function SuperAdminHeader({ onToggleSidebar }: SuperAdminHeaderProps) {
    const { effectiveUser, logout } = useAuth();
    const displayName = effectiveUser?.email ? effectiveUser.email.split('@')[0] : 'Super Admin';

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