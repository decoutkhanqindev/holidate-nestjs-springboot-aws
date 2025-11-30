//  src/app/(admin)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/Admin/AuthContext_Admin/AuthContextAdmin';
import { loginAdmin } from '@/lib/AdminAPI/adminAuthService';

export default function AdminLoginPage() {
    const auth = useAuth();
    const searchParams = useSearchParams();
    const redirectMessage = searchParams.get('message');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (redirectMessage === 'admin_redirect') {
            setInfo('Bạn đang đăng nhập với tài khoản Admin/Partner. Vui lòng đăng nhập lại tại đây.');
        }
    }, [redirectMessage]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // Gọi API login thật
            const loginResponse = await loginAdmin({ email, password });


            // Lưu user vào context - giữ nguyên role từ API (admin, partner, user)
            auth.login({
                id: loginResponse.id,
                email: loginResponse.email,
                fullName: loginResponse.fullName,
                role: {
                    id: loginResponse.role.id,
                    name: loginResponse.role.name,
                    description: loginResponse.role.description,
                },
            });

        } catch (error: any) {
            setError(error.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-pink-100">
            <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl border border-gray-100 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-400 to-pink-400 p-3 rounded-full mb-3 shadow-lg">
                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 1.79-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.21-3.582-4-8-4z" /></svg>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-2 tracking-wide bg-gradient-to-r from-blue-600 via-pink-400 to-cyan-400 bg-clip-text text-transparent" style={{ textShadow: '0 2px 8px #60a5fa, 0 0px 2px #f472b6', WebkitTextStroke: '1px #60a5fa' }}>
                        Trang Quản Trị
                    </h2>
                    <span className="text-gray-500 text-sm">Đăng nhập vào hệ thống của bạn</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full rounded-xl border border-gray-300 p-3 pl-12 shadow focus:outline-none focus:border-2 focus:border-blue-400 focus:ring-0 focus:bg-white text-gray-900 transition-all duration-200"
                            placeholder="ví dụ: admin@booking.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting} // Vô hiệu hóa input khi đang submit
                        />
                        <span className="absolute left-4 top-1/2 mt-1 transform -translate-y-1/2 text-blue-400">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#60a5fa" d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 0v.01L12 13l8-6.99V6H4zm16 2.236l-7.447 6.51a2 2 0 01-2.106 0L4 8.236V18h16V8.236z" /></svg>
                        </span>
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full rounded-xl border border-gray-300 p-3 pl-12 shadow focus:outline-none focus:border-2 focus:border-pink-400 focus:ring-0 focus:bg-white text-gray-900 transition-all duration-200"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isSubmitting} // Vô hiệu hóa input khi đang submit
                        />
                        <span className="absolute left-4 top-1/2 mt-1 transform -translate-y-1/2 text-pink-400">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#f472b6" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7V7a6 6 0 10-12 0v3a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2zm-8-3a4 4 0 118 0v3H6V7z" /></svg>
                        </span>
                    </div>

                    {info && (
                        <div className="text-blue-700 bg-blue-50 border border-blue-200 text-sm font-semibold text-center p-3 rounded-xl">
                            {info}
                        </div>
                    )}

                    {error && (
                        <div className="text-red-600 bg-red-100 border border-red-300 text-sm font-semibold text-center p-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-pink-400 to-red-400 py-3 text-lg font-bold text-white shadow-lg hover:scale-105 hover:from-blue-600 hover:to-red-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
}