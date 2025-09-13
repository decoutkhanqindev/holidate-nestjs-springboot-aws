// File: components/AuthModal.tsx (ĐÃ SỬA LỖI KHÔNG TẮT POPUP)
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AuthModal() {
    // Lấy thêm hàm `closeModal` trực tiếp từ context
    const { isModalOpen, closeModal, login } = useAuth();
    const [view, setView] = useState('social');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleEmailLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (email === 'user@booking.com' && password === 'user123') {
            // 1. Gọi hàm login để cập nhật trạng thái người dùng
            login({ name: 'Phu Quoc', points: 0 });

            // 2. CẬP NHẬT QUAN TRỌNG: Gọi trực tiếp hàm closeModal() để đóng popup
            // Đây là dòng code sửa lỗi!
            closeModal();

            // Reset form sau khi đăng nhập
            setEmail('');
            setPassword('');
        } else {
            // Bỏ alert để trải nghiệm mượt hơn, thay bằng log hoặc thông báo lỗi tinh tế hơn
            alert('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Đăng ký thành công (DEMO)! Vui lòng đăng nhập.');
        setView('emailLogin');
    };

    // ----- PHẦN BÊN DƯỚI GIỮ NGUYÊN, KHÔNG THAY ĐỔI -----

    const renderContent = () => {
        if (view === 'emailLogin') {
            return (
                <form onSubmit={handleEmailLogin}>
                    <h4 className="fw-bold mb-4">Đăng nhập</h4>
                    <div className="mb-3">
                        <label htmlFor="emailLogin" className="form-label">Email</label>
                        <input
                            type="email"
                            id="emailLogin"
                            className="form-control form-control-lg"
                            placeholder="user@booking.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="passwordLogin" className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            id="passwordLogin"
                            className="form-control form-control-lg"
                            placeholder="user123"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100">Đăng nhập</button>
                    <p className="text-center mt-3">
                        Chưa có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('emailRegister'); }} className="fw-bold text-decoration-none">Đăng ký</a>
                    </p>
                </form>
            );
        }

        if (view === 'emailRegister') {
            return (
                <form onSubmit={handleRegister}>
                    <h4 className="fw-bold mb-4">Đăng ký</h4>
                    <div className="mb-3">
                        <label htmlFor="emailRegister" className="form-label">Email</label>
                        <input type="email" id="emailRegister" className="form-control form-control-lg" placeholder="your@email.com" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="passwordRegister" className="form-label">Mật khẩu</label>
                        <input type="password" id="passwordRegister" className="form-control form-control-lg" placeholder="********" required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100">Đăng ký</button>
                    <p className="text-center mt-3">
                        Đã có tài khoản? <a href="#" onClick={(e) => { e.preventDefault(); setView('emailLogin'); }} className="fw-bold text-decoration-none">Đăng nhập</a>
                    </p>
                </form>
            );
        }

        return (
            <>
                <div className="text-center mb-4">
                    <div className="p-3 bg-light rounded-3 d-inline-block">
                        <span style={{ fontSize: '40px' }}>🎟️</span>
                    </div>
                    <h4 className="fw-bold mt-3">Chúng tôi có một ưu đãi vô cùng hấp dẫn!</h4>
                </div>
                <div className="d-grid gap-3">
                    <button className="btn btn-lg btn-outline-dark d-flex align-items-center justify-content-center"><span className="ms-2">Apple</span></button>
                    <button className="btn btn-lg btn-outline-dark d-flex align-items-center justify-content-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16"><path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" /></svg>
                        <span className="ms-2">Google</span>
                    </button>
                    <a href="#" onClick={(e) => { e.preventDefault(); setView('emailLogin'); }} className="text-center text-primary fw-bold text-decoration-none mt-2">Các lựa chọn khác</a>
                </div>
                <hr />
                <p className="text-center text-muted small">
                    Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản và Điều kiện</a> và <a href="#">Chính sách bảo vệ dữ liệu</a> của chúng tôi.
                </p>
                <button onClick={closeModal} className="btn btn-link text-decoration-none w-100 mt-2">
                    Tìm kiếm với tư cách là khách
                </button>
            </>
        );
    };

    if (!isModalOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content p-4 rounded-4">
                    <div className="modal-header border-0">
                        <button type="button" className="btn-close" onClick={closeModal}></button>
                    </div>
                    <div className="modal-body">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}