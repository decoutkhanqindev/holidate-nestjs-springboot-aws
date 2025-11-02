// app/auth/forgot-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword
} from '@/service/authService'; // Nhớ điều chỉnh đường dẫn nếu cần

type Step = 'enterEmail' | 'enterOtp' | 'createNew';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('enterEmail');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        let timerId: NodeJS.Timeout;
        if (step === 'enterOtp' && countdown > 0) {
            timerId = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timerId);
    }, [step, countdown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await sendPasswordResetOtp({ email });
            setStep('enterOtp');
            setCountdown(60);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Email không tồn tại hoặc có lỗi xảy ra.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await verifyPasswordResetOtp({ email, otp });
            setStep('createNew');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Mã OTP không hợp lệ.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await resetPassword({ email, otp, password: newPassword });
            alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
            router.push('/auth/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await sendPasswordResetOtp({ email });
            alert(`Mã OTP mới đã được gửi lại.`);
            setCountdown(60);
        } catch (err) {
            alert('Gửi lại mã thất bại. Vui lòng thử lại sau.');
        }
    };


    const renderStep = () => {
        switch (step) {
            case 'enterEmail':
                return (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500" placeholder="your@example.com" required disabled={isLoading} />
                        </div>
                        <button type="submit" className="w-full rounded-md bg-indigo-600 py-3 text-lg font-semibold text-white hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
                        </button>
                    </form>
                );
            case 'enterOtp':
                return (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <p className="text-center text-sm text-gray-600">Mã xác nhận đã được gửi đến <strong>{email}</strong>.</p>
                        <div>
                            <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">Mã OTP</label>
                            <input type="text" id="otp" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full rounded-md border p-3 text-center tracking-[0.5em] focus:border-indigo-500 focus:ring-indigo-500" maxLength={6} required disabled={isLoading} />
                        </div>
                        <button type="submit" className="w-full rounded-md bg-indigo-600 py-3 text-lg font-semibold text-white hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                        </button>
                        <div className="text-center text-sm">
                            {countdown > 0 ? (
                                <p className="text-gray-500">Gửi lại mã sau {countdown} giây</p>
                            ) : (
                                <button type="button" onClick={handleResendOtp} className="font-medium text-indigo-600 hover:underline">
                                    Gửi lại mã
                                </button>
                            )}
                        </div>
                    </form>
                );
            case 'createNew':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500" placeholder="********" required disabled={isLoading} />
                        </div>
                        <div>
                            <label htmlFor="confirmNewPassword" className="mb-2 block text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                            <input type="password" id="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full rounded-md border p-3 focus:border-indigo-500 focus:ring-indigo-500" placeholder="********" required disabled={isLoading} />
                        </div>
                        <button type="submit" className="w-full rounded-md bg-indigo-600 py-3 text-lg font-semibold text-white hover:bg-indigo-700" disabled={isLoading}>
                            {isLoading ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                        </button>
                    </form>
                );
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 pt-16">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h2>
                {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
                {renderStep()}
                <p className="mt-8 text-center text-sm text-gray-600">
                    Quay lại trang{' '}
                    <Link href="/auth/login" className="font-medium text-indigo-600 hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}