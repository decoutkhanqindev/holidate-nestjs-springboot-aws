// File: components/PublicNavbar.tsx (PHIÊN BẢN CÓ ĐIỀU KHIỂN)
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function PublicNavbar() {
    const { isLoggedIn, user, logout, openModal } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top" style={{ height: '64px' }}>
            <div className="container">
                {/* Sửa lỗi gạch chân ở logo */}
                <Link href="/" className="navbar-brand fw-bold fs-4 text-primary text-decoration-none">
                    Traveloka Clone
                </Link>

                <div className="ms-auto d-flex align-items-center">
                    <Link href="#" className="nav-link me-3 text-black fw-bold">Khách sạn</Link>
                    <Link href="#" className="nav-link me-4 text-black fw-bold">Hỗ trợ</Link>

                    {isLoggedIn && user ? (
                        // --- GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP ---
                        <div className="dropdown">
                            <button className="btn btn-outline-primary dropdown-toggle d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                👤 {user.name} | 💰 {user.points} Điểm
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#">Bạn là thành viên Bronze</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" href="#">Chỉnh sửa hồ sơ</a></li>
                                <li><a className="dropdown-item" href="#">Đặt chỗ của tôi</a></li>
                                <li><a className="dropdown-item" href="#">Hoàn tiền</a></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li><a className="dropdown-item" href="#" onClick={logout}>Đăng xuất</a></li>
                            </ul>
                        </div>
                    ) : (
                        // --- GIAO DIỆN KHI CHƯA ĐĂNG NHẬP ---
                        <div className="d-flex align-items-center">
                            <button onClick={openModal} className="btn btn-outline-primary me-2">
                                Đăng nhập
                            </button>
                            <button onClick={openModal} className="btn btn-primary">
                                Đăng ký
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}