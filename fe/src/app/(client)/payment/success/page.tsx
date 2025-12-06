// src/app/payment/success/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/service/bookingService';

// Định nghĩa kiểu dữ liệu cho chi tiết booking
interface BookingDetails {
    id: string;
    status: string; // 'confirmed' | 'pending_payment' | 'cancelled' | 'checked_in' | 'completed' | 'rescheduled'
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
    numberOfNights?: number;
    numberOfAdults: number;
    numberOfChildren: number;
    contactFullName: string;
    contactEmail: string;
    contactPhone: string;
    createdAt: string;
    priceDetails: {
        finalPrice: number;
    };
}

function SuccessComponent() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');

    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (bookingId) {
            const fetchBookingDetails = async () => {
                try {
                    setIsLoading(true);
                    const data = await bookingService.getBookingById(bookingId);
                    setBookingDetails(data);
                } catch (err: any) {
                    setError(err.message || 'Thanh toán thành công nhưng không thể tải chi tiết đơn hàng. Vui lòng kiểm tra mục "Đơn hàng của tôi".');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchBookingDetails();
        } else {
            setError("Không tìm thấy mã đơn hàng trên URL.");
            setIsLoading(false);
        }
    }, [bookingId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString('vi-VN', {
            day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    // Style nội tuyến cho đơn giản
    const containerStyle: React.CSSProperties = { fontFamily: 'sans-serif', maxWidth: '800px', margin: '40px auto', padding: '20px' };
    const centeredStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' };
    const headerStyle: React.CSSProperties = { textAlign: 'center', color: '#28a745', marginBottom: '40px' };
    const cardStyle: React.CSSProperties = { backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' };
    const infoRowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', alignItems: 'center' };
    const buttonStyle: React.CSSProperties = { display: 'inline-block', padding: '12px 24px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', border: '1px solid #007bff' };
    const secondaryButtonStyle: React.CSSProperties = { display: 'inline-block', padding: '12px 24px', backgroundColor: 'transparent', color: '#007bff', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold', border: '1px solid #007bff' };
    const actionsStyle: React.CSSProperties = { textAlign: 'center', marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '20px' };

    if (isLoading) {
        return <div style={centeredStyle}><h2>Đang tải chi tiết đơn hàng...</h2></div>;
    }

    if (error || !bookingDetails) {
        return <div style={centeredStyle}><h2>Đã xảy ra lỗi</h2><p>{error || "Không thể hiển thị thông tin đơn hàng."}</p><Link href="/" style={buttonStyle}>Về trang chủ</Link></div>;
    }

    // Xác định thông báo và màu sắc dựa trên status
    const getStatusInfo = () => {
        const status = bookingDetails.status?.toLowerCase();

        if (status === 'cancelled') {
            return {
                title: 'Hủy phòng thành công',
                message: 'Đơn hàng của bạn đã được hủy thành công. Nếu đã thanh toán, tiền hoàn lại sẽ được xử lý trong vòng 5-7 ngày làm việc.',
                color: '#ff9800', // Màu cam cho hủy
                headerColor: '#ff9800'
            };
        } else if (status === 'pending_payment') {
            return {
                title: 'Chưa thanh toán',
                message: 'Đơn hàng của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để xác nhận đặt phòng.',
                color: '#ffc107', // Màu vàng cho chờ thanh toán
                headerColor: '#ffc107'
            };
        } else if (status === 'confirmed') {
            return {
                title: 'Đặt phòng thành công!',
                message: 'Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Thông tin xác nhận đã được gửi đến email của bạn.',
                color: '#28a745', // Màu xanh lá cho thành công
                headerColor: '#28a745'
            };
        } else {
            // Các trạng thái khác (checked_in, completed, rescheduled)
            return {
                title: 'Thông tin đơn hàng',
                message: 'Đơn hàng của bạn đã được xử lý.',
                color: '#007bff', // Màu xanh dương mặc định
                headerColor: '#007bff'
            };
        }
    };

    const statusInfo = getStatusInfo();

    // Kiểm tra xem đơn hàng có quá hạn check-in hoặc check-out không
    const checkExpirationStatus = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset về đầu ngày để so sánh

        const checkInDate = new Date(bookingDetails.checkInDate);
        checkInDate.setHours(0, 0, 0, 0);

        const checkOutDate = new Date(bookingDetails.checkOutDate);
        checkOutDate.setHours(0, 0, 0, 0);

        const isCheckInExpired = checkInDate < today;
        const isCheckOutExpired = checkOutDate < today;

        return { isCheckInExpired, isCheckOutExpired };
    };

    const expirationStatus = checkExpirationStatus();

    return (
        <div style={containerStyle}>
            <div style={{ ...headerStyle, color: statusInfo.headerColor }}>
                <h1>{statusInfo.title}</h1>
                <p>{statusInfo.message}</p>
            </div>

            {/* Hiển thị cảnh báo nếu đã quá hạn check-in */}
            {expirationStatus.isCheckInExpired && (
                <div style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    color: '#856404'
                }}>
                    <strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
                        ⚠️ Cảnh báo: Đã quá hạn check-in
                    </strong>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        Ngày nhận phòng ({formatDate(bookingDetails.checkInDate)}) đã qua.
                        {bookingDetails.status?.toLowerCase() === 'confirmed'
                            ? ' Vui lòng liên hệ khách sạn để được hỗ trợ.'
                            : ' Đơn hàng này có thể đã được xử lý hoặc hủy tự động.'}
                    </p>
                </div>
            )}

            {/* Hiển thị cảnh báo nếu đã quá hạn check-out nhưng chưa completed */}
            {expirationStatus.isCheckOutExpired &&
                bookingDetails.status?.toLowerCase() !== 'completed' &&
                bookingDetails.status?.toLowerCase() !== 'cancelled' && (
                    <div style={{
                        backgroundColor: '#f8d7da',
                        border: '1px solid #dc3545',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        color: '#721c24'
                    }}>
                        <strong style={{ display: 'block', marginBottom: '8px', fontSize: '16px' }}>
                            ⚠️ Cảnh báo: Đã quá hạn check-out
                        </strong>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            Ngày trả phòng ({formatDate(bookingDetails.checkOutDate)}) đã qua.
                            Đơn hàng này nên đã được hoàn thành hoặc hủy.
                        </p>
                    </div>
                )}

            <div style={cardStyle}>
                <h2>Chi tiết đơn hàng</h2>
                <div style={infoRowStyle}>
                    <span>Mã đơn hàng:</span>
                    <strong>{bookingDetails.id}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Thời gian đặt:</span>
                    <strong>{formatDateTime(bookingDetails.createdAt)}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Trạng thái:</span>
                    <strong style={{
                        color: statusInfo.color,
                        padding: '4px 12px',
                        borderRadius: '4px',
                        backgroundColor: statusInfo.color + '20',
                        fontSize: '14px'
                    }}>
                        {statusInfo.title}
                    </strong>
                </div>
                <hr />

                <h3>Thông tin người đặt</h3>
                <div style={infoRowStyle}>
                    <span>Họ và tên:</span>
                    <strong>{bookingDetails.contactFullName}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Email:</span>
                    <strong>{bookingDetails.contactEmail}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Số điện thoại:</span>
                    <strong>{bookingDetails.contactPhone}</strong>
                </div>
                <hr />

                <h3>Thông tin khách sạn</h3>
                <div style={infoRowStyle}>
                    <span>Khách sạn:</span>
                    <strong>{bookingDetails.hotel.name}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Địa chỉ:</span>
                    <span style={{ textAlign: 'right' }}>{`${bookingDetails.hotel.address}, ${bookingDetails.hotel.street.name}, ${bookingDetails.hotel.ward.name}, ${bookingDetails.hotel.district.name}, ${bookingDetails.hotel.city.name}`}</span>
                </div>
                <hr />

                <h3>Chi tiết phòng</h3>
                <div style={infoRowStyle}>
                    <span>Loại phòng:</span>
                    <strong>{bookingDetails.room.name}</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Thời gian lưu trú:</span>
                    <strong>
                        {bookingDetails.numberOfNights
                            ? `${bookingDetails.numberOfNights} đêm`
                            : `${Math.ceil((new Date(bookingDetails.checkOutDate).getTime() - new Date(bookingDetails.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} đêm`}
                    </strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Nhận phòng:</span>
                    <span style={{
                        color: expirationStatus.isCheckInExpired ? '#dc3545' : 'inherit',
                        fontWeight: expirationStatus.isCheckInExpired ? 'bold' : 'normal'
                    }}>
                        {formatDate(bookingDetails.checkInDate)}
                        {expirationStatus.isCheckInExpired && ' (Đã quá hạn)'}
                    </span>
                </div>
                <div style={infoRowStyle}>
                    <span>Trả phòng:</span>
                    <span style={{
                        color: expirationStatus.isCheckOutExpired ? '#dc3545' : 'inherit',
                        fontWeight: expirationStatus.isCheckOutExpired ? 'bold' : 'normal'
                    }}>
                        {formatDate(bookingDetails.checkOutDate)}
                        {expirationStatus.isCheckOutExpired && ' (Đã quá hạn)'}
                    </span>
                </div>
                <hr />

                {bookingDetails.status?.toLowerCase() !== 'cancelled' && (
                    <div style={{ ...infoRowStyle, fontSize: '1.4rem', fontWeight: 'bold' }}>
                        <span>Tổng thanh toán:</span>
                        <strong style={{ color: '#d9534f' }}>{bookingDetails.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</strong>
                    </div>
                )}
                {bookingDetails.status?.toLowerCase() === 'cancelled' && (
                    <div style={{ ...infoRowStyle, fontSize: '1.4rem', fontWeight: 'bold' }}>
                        <span>Giá trị đơn hàng:</span>
                        <strong style={{ color: '#666', textDecoration: 'line-through' }}>{bookingDetails.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</strong>
                    </div>
                )}
            </div>

            <div style={actionsStyle}>
                <Link href="/" style={buttonStyle}>Về trang chủ</Link>
                <Link href="/my-booking" style={secondaryButtonStyle}>Xem lịch sử đặt phòng</Link>
                {bookingDetails.status?.toLowerCase() === 'pending_payment' && (
                    <Link
                        href={`/booking?bookingId=${bookingDetails.id}`}
                        style={{ ...buttonStyle, backgroundColor: '#28a745', borderColor: '#28a745' }}
                    >
                        Thanh toán ngay
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>}>
            <SuccessComponent />
        </Suspense>
    );
}