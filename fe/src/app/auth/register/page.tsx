'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientRegisterPage() {
    const router = useRouter();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Đăng ký Client thành công (DEMO)! Vui lòng đăng nhập.');
        router.push('/auth/login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 pt-16">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Đăng ký tài khoản</h2>
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" className="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500" placeholder="your@example.com" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <input type="password" id="password" className="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500" placeholder="********" required />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                        <input type="password" id="confirmPassword" className="w-full rounded-md border p-3 focus:border-green-500 focus:ring-green-500" placeholder="********" required />
                    </div>
                    <button type="submit" className="w-full rounded-md bg-green-600 py-3 text-lg font-semibold text-white hover:bg-green-700">Đăng ký</button>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}