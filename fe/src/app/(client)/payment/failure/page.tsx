// src/app/payment/failure/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/service/bookingService';
import styles from './PaymentFailure.module.css';

function FailureComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const bookingId = searchParams.get('bookingId');
    const reason = searchParams.get('reason');
    const code = searchParams.get('code');
    const errorType = searchParams.get('errorType');

    const [booking, setBooking] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(!!bookingId);

    useEffect(() => {
        if (bookingId) {
            const fetchBooking = async () => {
                try {
                    const data = await bookingService.getBookingById(bookingId);
                    setBooking(data);
                } catch (err) {
                    // Ignore errors when fetching booking
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBooking();
        } else {
            setIsLoading(false);
        }
    }, [bookingId]);

    const getErrorMessage = () => {
        if (reason === 'payment_failed') {
            if (code) {
                const codeMessages: Record<string, string> = {
                    '07': 'Giao dịch bị nghi ngờ (liên quan đến lừa đảo, giao dịch bất thường).',
                    '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
                    '10': 'Xác thực thông tin thẻ/tài khoản không đúng. Quá 3 lần nhập sai.',
                    '11': 'Đã hết hạn chờ thanh toán. Vui lòng thử lại.',
                    '12': 'Thẻ/Tài khoản bị khóa.',
                    '13': 'Nhập sai mật khẩu xác thực giao dịch (OTP). Quá số lần cho phép.',
                    '24': 'Khách hàng hủy giao dịch.',
                    '51': 'Tài khoản không đủ số dư để thực hiện giao dịch.',
                    '65': 'Tài khoản đã vượt quá hạn mức giao dịch cho phép.',
                    '75': 'Ngân hàng thanh toán đang bảo trì.',
                    '79': 'Nhập sai mật khẩu thanh toán quá số lần quy định.',
                };
                return codeMessages[code] || `Thanh toán thất bại với mã lỗi: ${code}`;
            }
            return 'Thanh toán thất bại. Vui lòng thử lại.';
        }

        if (reason === 'invalid_signature') {
            return 'Chữ ký giao dịch không hợp lệ.';
        }

        if (reason === 'payment_already_processed') {
            return 'Giao dịch này đã được xử lý trước đó.';
        }

        if (reason === 'missing_transaction_ref') {
            return 'Thiếu thông tin giao dịch.';
        }

        if (errorType) {
            const errorMessages: Record<string, string> = {
                'VNPAY_TRANSACTION_SUSPICIOUS': 'Giao dịch bị nghi ngờ. Vui lòng liên hệ hỗ trợ.',
                'VNPAY_ACCOUNT_NOT_REGISTERED': 'Tài khoản chưa đăng ký dịch vụ Internet Banking.',
                'VNPAY_VERIFICATION_FAILED': 'Xác thực thất bại. Vui lòng thử lại.',
                'VNPAY_PAYMENT_EXPIRED': 'Phiên thanh toán đã hết hạn. Vui lòng tạo đơn hàng mới.',
                'VNPAY_ACCOUNT_LOCKED': 'Tài khoản đã bị khóa.',
                'VNPAY_OTP_INCORRECT': 'Mã OTP không đúng.',
                'VNPAY_TRANSACTION_CANCELLED': 'Bạn đã hủy giao dịch.',
                'VNPAY_INSUFFICIENT_BALANCE': 'Số dư tài khoản không đủ.',
                'VNPAY_TRANSACTION_LIMIT_EXCEEDED': 'Vượt quá hạn mức giao dịch.',
                'VNPAY_BANK_MAINTENANCE': 'Ngân hàng đang bảo trì. Vui lòng thử lại sau.',
                'VNPAY_PAYMENT_PASSWORD_INCORRECT': 'Mật khẩu thanh toán không đúng.',
            };
            return errorMessages[errorType] || 'Đã xảy ra lỗi trong quá trình thanh toán.';
        }

        return 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.';
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.failureCard}>
                <div className={styles.icon}>
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2" />
                        <path d="M12 8V12M12 16H12.01" stroke="#dc3545" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>
                <h1>Thanh toán thất bại</h1>
                <p className={styles.errorMessage}>{getErrorMessage()}</p>

                {booking && (
                    <div className={styles.bookingInfo}>
                        <h3>Thông tin đơn hàng</h3>
                        <p><strong>Mã đơn hàng:</strong> {booking.id}</p>
                        <p><strong>Khách sạn:</strong> {booking.hotel?.name}</p>
                        <p><strong>Tổng tiền:</strong> {booking.priceDetails?.finalPrice?.toLocaleString('vi-VN')} VND</p>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        onClick={() => router.push('/my-booking')}
                        className={styles.primaryButton}
                    >
                        Xem lại đơn hàng
                    </button>
                    <Link href="/" className={styles.secondaryButton}>
                        Về trang chủ
                    </Link>
                </div>

                <div className={styles.helpSection}>
                    <p className={styles.helpTitle}>Cần hỗ trợ?</p>
                    <p className={styles.helpText}>
                        Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ hotline: <strong>1900 55 55 77</strong>
                    </p>
                    <p className={styles.helpText}>
                        Hoặc email: <strong>hotrovnpay@vnpay.vn</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        }>
            <FailureComponent />
        </Suspense>
    );
}

