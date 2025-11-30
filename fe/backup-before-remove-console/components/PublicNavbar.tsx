
'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import styles from './PublicNavbar.module.css';
import { NavDropdown } from 'react-bootstrap';

export default function PublicNavbar() {
    const { isLoggedIn, user, logout, openModal } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Debug: Log khi user hoặc avatarUrl thay đổi
    useEffect(() => {
        // User state tracking
    }, [user, user?.avatarUrl]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top" style={{ height: '64px' }}>
                <div className="container">
                    <Link href="/" className="navbar-brand fw-bold fs-4 text-primary text-decoration-none">
                        Holidate
                    </Link>

                    {/* ===  MENU  DESKTOP === */}
                    <div className="ms-auto d-none d-lg-flex align-items-center">
                        <Link href="/hotels" className="nav-link me-3 text-black fw-bold">Khách sạn</Link>

                        <NavDropdown
                            title="Hỗ trợ"
                            id="basic-nav-dropdown"
                            className="text-black fw-bold me-4"
                            // Thêm align="end" để menu canh lề phải
                            align="end"
                        >
                            <NavDropdown.Item as={Link} href="/help" className="d-flex align-items-center py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" /><path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94" /></svg>
                                <span className="ms-2">Trợ giúp</span>
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} href="/contact" className="d-flex align-items-center py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-chat-left-text" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" /><path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" /></svg>
                                <span className="ms-2">Liên hệ chúng tôi</span>
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} href="/inbox" className="d-flex align-items-center py-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-mailbox" viewBox="0 0 16 16"><path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3m0-1h.212a2 2 0 0 1 .936.25l1.092.656A2 2 0 0 1 8 6.965V8.5h8V7a3 3 0 0 0-3-3H9V3.5a4 4 0 0 1 1.713-3.289L11.437.05A2 2 0 0 1 12.212 0h.212A2 2 0 0 1 14 1.25V3h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1.5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5V10H.5a.5.5 0 0 1 0-1H2V8H.5a.5.5 0 0 1 0-1H2V6H.5a.5.5 0 0 1 0-1H2V4.5A2.5 2.5 0 0 1 4.5 2H5V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h.5A1.5 1.5 0 0 1 12 3.5V4h-1V3.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V4h-1V3.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5V4H4z" /><path d="M2.5 7.5A.5.5 0 0 0 3 8v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5z" /></svg>
                                <span className="ms-2">Hộp thư của tôi</span>
                            </NavDropdown.Item>
                        </NavDropdown>

                        {isClient && (isLoggedIn && user ? (
                            <div className="dropdown">
                                <button className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    {user.avatarUrl ? (
                                        <img
                                            key={`avatar-${user.avatarUrl}`} // Force re-render khi avatarUrl thay đổi
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="rounded-circle"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                objectFit: 'cover',
                                                border: '2px solid #0d6efd'
                                            }}
                                            onError={(e) => {
                                                // Fallback nếu ảnh không load được
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span>{user.fullName}</span>
                                    <span className="text-muted">|</span>
                                    {/* <span>💰 {user.score ?? 0} Điểm</span> */}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    {/* <li><a className="dropdown-item" href="#">Bạn là thành viên Bronze</a></li> */}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><Link className="dropdown-item" href="/account/settings">Chỉnh sửa hồ sơ</Link></li>
                                    <li><Link className="dropdown-item" href="/my-booking">Đặt chỗ của tôi</Link></li>
                                    <li><a className="dropdown-item" href="#">Hoàn tiền</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={logout}>Đăng xuất</button></li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex align-items-center">
                                <button onClick={openModal} className="btn btn-outline-primary me-2">Đăng nhập</button>
                                <button onClick={openModal} className="btn btn-primary">Đăng ký</button>
                            </div>
                        ))}
                    </div>

                    {/* ===  HAMBURGER  MOBILE === */}
                    <button className="btn d-lg-none" type="button" onClick={toggleMenu} aria-label="Toggle navigation">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16"><path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" /></svg>
                    </button>
                </div>
            </nav>

            {/* ===  MENU MOBILE === */}
            {isMenuOpen && (
                <div>
                    <div className={styles.mobileMenuBackdrop} onClick={toggleMenu}></div>
                    <div className={styles.mobileMenuPanel}>
                        <div className={styles.mobileMenuHeader}>
                            {isLoggedIn && user ? (
                                <div>
                                    <p className="fw-bold fs-5 mb-0 text-dark">{user.fullName}</p>
                                    <small className='text-muted'>{user.email}</small>
                                </div>
                            ) : (
                                <p className="fw-bold fs-5 mb-0">Menu</p>
                            )}
                            <button onClick={toggleMenu} className={`btn ${styles.closeButton}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" /></svg>
                            </button>
                        </div>
                        <ul className={styles.mobileMenuList}>
                            <li><Link href="/" onClick={toggleMenu}>🏠 Trang chủ</Link></li>
                            <li><Link href="/hotels" onClick={toggleMenu}>🏨 Khách sạn</Link></li>

                            {isLoggedIn && (
                                <>
                                    <hr />
                                    <li><Link href="/account/settings" onClick={toggleMenu}>👤 Chỉnh sửa hồ sơ</Link></li>
                                    <li><Link href="/my-booking" onClick={toggleMenu}>🧾 Đặt chỗ của tôi</Link></li>
                                    <li><Link href="#" onClick={toggleMenu}>💸 Hoàn tiền</Link></li>
                                </>
                            )}
                            <hr />
                            <li><Link href="/contact" onClick={toggleMenu}>💬 Liên hệ chúng tôi</Link></li>
                            <li><Link href="/inbox" onClick={toggleMenu}>📬 Hộp thư của tôi</Link></li>
                            <li><Link href="/help" onClick={toggleMenu}>❓ Trợ giúp</Link></li>
                            <hr />

                            {isLoggedIn ? (
                                <li><button className={styles.logoutButton} onClick={() => { logout(); toggleMenu(); }}>Đăng xuất</button></li>
                            ) : (
                                <div className='d-grid gap-2'>
                                    <button className="btn btn-primary" onClick={() => { openModal(); toggleMenu(); }}>Đăng nhập / Đăng ký</button>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </>
    );
}
