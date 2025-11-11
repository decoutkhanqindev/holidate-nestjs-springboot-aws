// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientLoginPage() {
    const router = useRouter();
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await login(email, password);
            // Redirect sẽ được xử lý trong AuthContext
            // Nếu là USER -> redirect về trang chủ
            // Nếu là ADMIN/PARTNER -> redirect về trang admin login
        } catch (error: any) {
            console.error('[ClientLoginPage] Login error:', error);
            setError(error?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        }
    };

    const handleGoogleLogin = () => {
        // Redirect đến OAuth2 endpoint của backend
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 pt-16">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Đăng nhập (Khách hàng)</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
                            {/* THÊM MỚI */}
                            <Link href="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <input
                            type="password"
                            id="password"
                            className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 bg-red-100 border border-red-300 text-sm font-semibold text-center p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-md bg-indigo-600 py-3 text-lg font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
                    </button>
                </form>
                <div className="my-8 flex items-center"><div className="flex-grow border-t"></div><span className="mx-4 text-gray-500">Hoặc</span><div className="flex-grow border-t"></div></div>
                {/* <button onClick={handleGoogleLogin} className="flex w-full items-center justify-center space-x-3 rounded-md border bg-white py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50">
                    <span>Đăng nhập với Google</span>
                </button> */}
                {/* THAY ĐỔI Ở ĐÂY */}
                <button
                    onClick={handleGoogleLogin}
                    type="button"
                    className="flex w-full items-center justify-center space-x-3 rounded-md border bg-white py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {/* Có thể thêm icon Google vào đây nếu muốn */}
                    <span>Đăng nhập với Google</span>
                </button>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href="/auth/register" className="font-medium text-indigo-600 hover:underline">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}