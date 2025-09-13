// File: app/admin/login/page.tsx
'use client';

import { useState } from 'react'; // Import useState để lưu trữ giá trị input
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();

    // Tạo state để lưu email và mật khẩu người dùng nhập
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form gửi lại trang

        // ---- LOGIC KIỂM TRA TÀI KHOẢN DEMO ----
        if (email === 'admin@booking.com' && password === 'admin123') {
            // Nếu đúng, thông báo thành công và chuyển trang
            alert('Đăng nhập Admin thành công!');
            router.push('/admin/dashboard'); // Chuyển hướng đến trang dashboard
        } else {
            // Nếu sai, thông báo lỗi và không làm gì cả
            alert('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-800">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Đăng nhập (Admin)</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full rounded-md border p-3 focus:border-red-500 focus:ring-red-500"
                            placeholder="admin@booking.com"
                            value={email} // Gắn giá trị của input với state 'email'
                            onChange={(e) => setEmail(e.target.value)} // Cập nhật state khi người dùng gõ
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full rounded-md border p-3 focus:border-red-500 focus:ring-red-500"
                            placeholder="********"
                            value={password} // Gắn giá trị của input với state 'password'
                            onChange={(e) => setPassword(e.target.value)} // Cập nhật state khi người dùng gõ
                            required
                        />
                    </div>
                    <button type="submit" className="w-full rounded-md bg-red-600 py-3 text-lg font-semibold text-white hover:bg-red-700">Đăng nhập Admin</button>
                </form>
            </div>
        </div>
    );
}