// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientLoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Đăng nhập Client thành công (DEMO)!');
        router.push('/');
    };

    const handleGoogleLogin = () => {
        alert('Đăng nhập Client bằng Google thành công (DEMO)!');
        router.push('/');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 pt-16">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Đăng nhập (Khách hàng)</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500" placeholder="your@example.com" required />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
                            {/* THÊM MỚI */}
                            <Link href="/auth/forgot-password" className="text-sm font-medium text-indigo-600 hover:underline">
                                Quên mật khẩu?
                            </Link>
                        </div>
                        <input type="password" id="password" className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500" placeholder="********" required />
                    </div>
                    <button type="submit" className="w-full rounded-md bg-indigo-600 py-3 text-lg font-semibold text-white hover:bg-indigo-700">Đăng nhập</button>
                </form>
                <div className="my-8 flex items-center"><div className="flex-grow border-t"></div><span className="mx-4 text-gray-500">Hoặc</span><div className="flex-grow border-t"></div></div>
                <button onClick={handleGoogleLogin} className="flex w-full items-center justify-center space-x-3 rounded-md border bg-white py-3 text-lg font-semibold text-gray-700 hover:bg-gray-50">
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