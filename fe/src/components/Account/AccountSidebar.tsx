'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/account/settings', label: 'Tài khoản' },
    { href: '/account/bookings', label: 'Đặt chỗ của tôi' },
    { href: '/account/transactions', label: 'Danh sách giao dịch' },
    { href: '/account/refunds', label: 'Refunds' },
];

export default function AccountSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className="d-flex flex-column">
            {/*  thông tin người dùng */}
            <div className="d-flex align-items-center mb-4">
                <div className="flex-shrink-0">
                    <div className="bg-primary text-black rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                        <span className="fw-bold fs-5">{user.fullName.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
                <div className="flex-grow-1 ms-3 text-black">
                    <h5 className="mb-0">{user.fullName}</h5>
                    <small className="text-muted">{user.email.startsWith('google_') ? 'Đăng nhập với Google' : user.email}</small>
                </div>
            </div>

            {/*  menu điều hướng */}
            <div className="card border-0 shadow-sm">
                <div className="list-group list-group-flush">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`list-group-item list-group-item-action border-0 ${isActive ? 'active text-white' : ''}`}
                                style={isActive ? { backgroundColor: '#0d6efd' } : {}}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                    <a href="#" onClick={logout} className="list-group-item list-group-item-action border-0 text-danger">
                        Đăng xuất
                    </a>
                </div>
            </div>
        </div>
    );
}