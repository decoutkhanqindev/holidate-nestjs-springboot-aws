// src/app/payment/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { bookingService, BookingResponse } from '@/service/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import styles from './PaymentPage.module.css';

function PaymentComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const bookingId = searchParams.get('bookingId');
    const paymentUrlParam = searchParams.get('paymentUrl'); // Nhận paymentUrl từ URL nếu có

    const [booking, setBooking] = useState<BookingResponse | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(paymentUrlParam);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            setError('Không tìm thấy mã đơn hàng.');
            setIsLoading(false);
            return;
        }

        const fetchBooking = async () => {
            try {
                setIsLoading(true);

                // Nếu đã có paymentUrl từ URL param, dùng luôn
                if (paymentUrlParam) {
                    const data = await bookingService.getBookingById(bookingId);
                    if (data.status?.toLowerCase() !== 'pending_payment') {
                        setError('Đơn hàng này không còn ở trạng thái chờ thanh toán.');
                        setIsLoading(false);
                        return;
                    }
                    setBooking(data);
                    setIsLoading(false);
                    return;
                }

                // Nếu chưa có paymentUrl, thử lấy từ danh sách bookings trước
                // Vì theo API docs, paymentUrl có trong list khi status là pending_payment
                try {
                    if (user?.id) {
                        const bookingsData = await bookingService.getBookings({
                            'user-id': user.id,
                            'page': 0,
                            'size': 100, // Lấy nhiều để tìm booking
                            'sort-by': 'created-at',
                            'sort-dir': 'desc'
                        });

                        const foundBooking = bookingsData.content.find(b => b.id === bookingId);
                        if (foundBooking) {
                            setBooking(foundBooking);
                            if (foundBooking.paymentUrl) {
                                setPaymentUrl(foundBooking.paymentUrl);
                                setIsLoading(false);
                                return;
                            }
                            // Nếu tìm thấy booking nhưng không có paymentUrl, tiếp tục thử getBookingById
                        }
                    }
                } catch (listErr) {
                    // Nếu không lấy được từ list, tiếp tục thử getBookingById
                    console.log('Không thể lấy từ danh sách bookings:', listErr);
                }

                // Thử lấy từ getBookingById
                const data = await bookingService.getBookingById(bookingId);

                // Kiểm tra status
                if (data.status?.toLowerCase() !== 'pending_payment') {
                    setError('Đơn hàng này không còn ở trạng thái chờ thanh toán.');
                    setIsLoading(false);
                    return;
                }

                setBooking(data);

                // Nếu có paymentUrl trong response, dùng nó
                if (data.paymentUrl) {
                    setPaymentUrl(data.paymentUrl);
                } else {
                    // Nếu không có paymentUrl, có thể booking đã hết hạn hoặc paymentUrl đã bị xóa
                    // Vẫn hiển thị thông tin booking để người dùng biết
                    setBooking(data);
                    setError('Không tìm thấy URL thanh toán. Link thanh toán có thể đã hết hạn. Vui lòng hủy đơn hàng này và tạo đơn hàng mới.');
                }
            } catch (err: any) {
                setError(err.message || 'Không thể tải thông tin đơn hàng.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooking();
    }, [bookingId, paymentUrlParam]);

    // Tự động redirect khi có paymentUrl và booking
    useEffect(() => {
        if (paymentUrl && booking && !isRedirecting && !error) {
            const timer = setTimeout(() => {
                setIsRedirecting(true);
                window.location.href = paymentUrl;
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [paymentUrl, booking, isRedirecting, error]);

    const handleRedirectNow = () => {
        if (paymentUrl) {
            setIsRedirecting(true);
            window.location.href = paymentUrl;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải thông tin thanh toán...</p>
                </div>
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <h2>Đã xảy ra lỗi</h2>
                    <p>{error || 'Không thể hiển thị thông tin thanh toán.'}</p>
                    <div className={styles.errorActions}>
                        <button onClick={() => router.push('/my-booking')} className={styles.backButton}>
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu có booking nhưng không có paymentUrl (lỗi)
    if (error && booking) {
        return (
            <div className={styles.container}>
                <div className={styles.paymentCard}>
                    <div className={styles.header}>
                        <h1>Không thể thanh toán</h1>
                        <p className={styles.bookingId}>Mã đơn hàng: {booking.id.substring(0, 8)}...</p>
                    </div>

                    <div className={styles.errorMessageBox}>
                        <p>{error}</p>
                    </div>

                    <div className={styles.bookingInfo}>
                        <h2>Thông tin đặt phòng</h2>
                        <div className={styles.infoRow}>
                            <span>Khách sạn:</span>
                            <strong>{booking.hotel.name}</strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Phòng:</span>
                            <strong>{booking.room.name}</strong>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Nhận phòng:</span>
                            <span>{formatDate(booking.checkInDate)}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Trả phòng:</span>
                            <span>{formatDate(booking.checkOutDate)}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <span>Tổng tiền:</span>
                            <strong className={styles.finalPrice}>
                                {booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND
                            </strong>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={() => router.push('/my-booking')} className={styles.backButton}>
                            Quay lại danh sách đơn hàng
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className={styles.container}>
                <div className={styles.errorBox}>
                    <h2>Đã xảy ra lỗi</h2>
                    <p>Không thể tải thông tin đơn hàng.</p>
                    <button onClick={() => router.push('/my-booking')} className={styles.backButton}>
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.paymentCard}>
                <div className={styles.header}>
                    <h1>Thanh toán đơn hàng</h1>
                    <p className={styles.bookingId}>Mã đơn hàng: {booking.id.substring(0, 8)}...</p>
                </div>

                <div className={styles.bookingInfo}>
                    <h2>Thông tin đặt phòng</h2>
                    <div className={styles.infoRow}>
                        <span>Khách sạn:</span>
                        <strong>{booking.hotel.name}</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Phòng:</span>
                        <strong>{booking.room.name}</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Nhận phòng:</span>
                        <span>{formatDate(booking.checkInDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Trả phòng:</span>
                        <span>{formatDate(booking.checkOutDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Số khách:</span>
                        <span>{booking.numberOfAdults} người lớn{booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} trẻ em` : ''}</span>
                    </div>
                </div>

                <div className={styles.priceSection}>
                    <div className={styles.priceRow}>
                        <span>Tổng thanh toán:</span>
                        <strong className={styles.finalPrice}>
                            {booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND
                        </strong>
                    </div>
                </div>

                {isRedirecting ? (
                    <div className={styles.redirecting}>
                        <div className={styles.spinner}></div>
                        <p>Đang chuyển đến cổng thanh toán VNPay...</p>
                    </div>
                ) : (
                    <div className={styles.actions}>
                        <p className={styles.warning}>
                            Bạn sẽ được chuyển đến cổng thanh toán VNPay trong vài giây...
                        </p>
                        <p className={styles.note}>
                            ⚠️ Lưu ý: Link thanh toán có thời hạn. Nếu link đã hết hạn, vui lòng tạo đơn hàng mới.
                        </p>
                        <button onClick={handleRedirectNow} className={styles.payButton}>
                            Thanh toán ngay
                        </button>
                        <button onClick={() => router.push('/my-booking')} className={styles.cancelButton}>
                            Hủy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải...</p>
                </div>
            </div>
        }>
            <PaymentComponent />
        </Suspense>
    );
}

