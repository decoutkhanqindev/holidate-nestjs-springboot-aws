// src/app/booking/confirmation/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image'; // Đảm bảo bạn có các icon trong thư mục public/icons
import { bookingService } from '@/service/bookingService';
import styles from './BookingConfirmation.module.css';

// Định nghĩa kiểu dữ liệu cho chi tiết booking
interface BookingDetails {
    id: string;
    status: 'confirmed' | 'pending' | 'failed' | 'cancelled';
    hotel: {
        name: string;
        address: string;
        street: { name: string };
        ward: { name: string };
        district: { name: string };
        city: { name: string };
    };
    room: {
        name: string;
    };
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    numberOfAdults: number;
    numberOfChildren: number;
    contactFullName: string;
    priceDetails: {
        finalPrice: number;
    };
}

function ConfirmationComponent() {
    const searchParams = useSearchParams();

    // Đọc tất cả các tham số cần thiết từ URL do VNPay trả về
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const bookingId = searchParams.get('vnp_TxnRef'); // VNPay trả về bookingId trong vnp_TxnRef

    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Kiểm tra ngay từ đầu xem thanh toán có thành công không
    const isPaymentSuccess = vnp_ResponseCode === '00';

    useEffect(() => {
        // Chỉ fetch chi tiết đơn hàng nếu có bookingId VÀ thanh toán thành công
        if (bookingId && isPaymentSuccess) {
            const fetchBookingDetails = async () => {
                try {
                    setIsLoading(true);
                    const data = await bookingService.getBookingById(bookingId);
                    // Kiểm tra lại trạng thái từ API cho chắc chắn
                    if (data && data.status === 'confirmed') {
                        setBookingDetails(data);
                    } else {
                        // Trường hợp "race condition": thanh toán thành công nhưng DB chưa cập nhật
                        // Ta vẫn hiển thị thành công nhưng có thể thông báo cho người dùng
                        setBookingDetails(data); // Vẫn hiển thị thông tin
                    }
                } catch (err: any) {
                    setError(err.message || 'Không thể tải thông tin đơn hàng.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBookingDetails();
        } else {
            // Nếu không có bookingId hoặc thanh toán thất bại, không cần gọi API
            setIsLoading(false);
        }
    }, [bookingId, isPaymentSuccess]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    // Màn hình loading trong khi chờ gọi API
    if (isLoading) {
        return <div className={styles.centered}><h2>Đang kiểm tra kết quả thanh toán...</h2><p>Vui lòng chờ trong giây lát.</p></div>;
    }

    // Màn hình lỗi (nếu có lỗi từ API)
    if (error) {
        return <div className={`${styles.centered} ${styles.errorState}`}><h2>Đã xảy ra lỗi</h2><p>{error}</p><Link href="/" className={styles.homeButton}>Về trang chủ</Link></div>;
    }

    // Màn hình thanh toán THÀNH CÔNG (dựa vào tín hiệu từ VNPay và có thông tin booking)
    if (isPaymentSuccess && bookingDetails) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.successHeader}>
                    {/* <Image src="/icons/payment-success.svg" alt="Thành công" width={80} height={80} /> */}
                    <h1>Đặt phòng thành công!</h1>
                    <p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Thông tin xác nhận đã được gửi đến email của bạn.</p>
                </div>

                <div className={styles.detailsCard}>
                    <h2>Chi tiết đơn hàng</h2>
                    <div className={styles.infoRow}>
                        <span>Mã đơn hàng:</span>
                        <strong>{bookingDetails.id}</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Trạng thái:</span>
                        <strong className={styles.statusConfirmed}>ĐÃ XÁC NHẬN</strong>
                    </div>
                    <hr className={styles.divider} />

                    <h3>Thông tin khách sạn</h3>
                    <div className={styles.infoRow}>
                        <span>Khách sạn:</span>
                        <strong>{bookingDetails.hotel.name}</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Địa chỉ:</span>
                        <span>{`${bookingDetails.hotel.address}, ${bookingDetails.hotel.street.name}, ${bookingDetails.hotel.ward.name}, ${bookingDetails.hotel.district.name}, ${bookingDetails.hotel.city.name}`}</span>
                    </div>

                    <hr className={styles.divider} />

                    <h3>Chi tiết phòng</h3>
                    <div className={styles.infoRow}>
                        <span>Loại phòng:</span>
                        <strong>{bookingDetails.room.name}</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Thời gian lưu trú:</span>
                        <strong>{bookingDetails.numberOfNights} đêm</strong>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Nhận phòng:</span>
                        <span>{formatDate(bookingDetails.checkInDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Trả phòng:</span>
                        <span>{formatDate(bookingDetails.checkOutDate)}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>Số khách:</span>
                        <span>{bookingDetails.numberOfAdults} người lớn{bookingDetails.numberOfChildren > 0 ? `, ${bookingDetails.numberOfChildren} trẻ em` : ''}</span>
                    </div>

                    <hr className={styles.divider} />

                    <h3>Thông tin khách hàng</h3>
                    <div className={styles.infoRow}>
                        <span>Họ và tên:</span>
                        <strong>{bookingDetails.contactFullName}</strong>
                    </div>

                    <hr className={styles.divider} />

                    <div className={`${styles.infoRow} ${styles.totalPrice}`}>
                        <span>Tổng thanh toán:</span>
                        <strong>{bookingDetails.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href="/" className={styles.homeButton}>Về trang chủ</Link>
                    <Link href="/my-bookings" className={styles.myBookingsButton}>Xem đơn hàng của tôi</Link>
                </div>
            </div>
        );
    }

    // Màn hình thanh toán THẤT BẠI
    return (
        <div className={`${styles.centered} ${styles.errorState}`}>
            {/* <Image src="/icons/payment-failed.svg" alt="Thất bại" width={80} height={80} /> */}
            <h2>Thanh toán không thành công</h2>
            <p>Đã có lỗi xảy ra hoặc bạn đã hủy giao dịch. Đơn hàng của bạn chưa được xác nhận.</p>
            {bookingId && <p>Mã đơn hàng tham chiếu: <strong>{bookingId}</strong></p>}
            <div className={styles.actions}>
                <Link href="/" className={styles.homeButton}>Về trang chủ</Link>
            </div>
        </div>
    );
}


export default function BookingConfirmationPage() {
    return (
        <Suspense fallback={<div className={styles.centered}><h2>Đang tải trang xác nhận...</h2></div>}>
            <ConfirmationComponent />
        </Suspense>
    );
}