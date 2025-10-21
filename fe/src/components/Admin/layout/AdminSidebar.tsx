"use client";
// src/components/admin/layout/AdminSidebar.tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/admin-dashboard', label: 'Trang chủ', icon: 'bi-house-door-fill' },
    { href: '/admin-rooms', label: 'Quản lý phòng', icon: 'bi-building-fill' },
    { href: '/admin-hotels', label: 'Quản lý khách sạn', icon: 'bi-building' },
    { href: 'admin-bookings', label: 'Quản lý đặt phòng', icon: 'bi-calendar-check' },
    { href: '/admin-users', label: 'Quản lý người dùng', icon: 'bi-person-fill' },
    { href: '/admin-marketing', label: 'Marketing', icon: 'bi-megaphone' },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="bg-dark text-white p-0" style={{ width: '250px', minHeight: '100vh', boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}>
            <div className="p-3 pb-2 border-bottom border-secondary" style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, color: '#4fd1c5' }}>
                <i className="bi bi-person-circle me-2" style={{ fontSize: 22 }}></i> Admin Menu
            </div>
            <ul className="nav flex-column mb-2 mt-2">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                        <li key={link.href} className="nav-item mb-1">
                            <Link
                                href={link.href}
                                className={`nav-link d-flex align-items-center px-3 py-2 rounded-2 transition ${isActive ? 'bg-info text-white fw-bold' : 'text-white'
                                    } hover:bg-secondary`}
                                style={{ fontSize: 15 }}
                            >
                                <i className={`bi ${link.icon} me-2`} style={{ fontSize: 18 }}></i> {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}