// src/app/payment/success/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { bookingService } from '@/service/bookingService';

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

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1>Đặt phòng thành công!</h1>
                <p>Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi. Thông tin xác nhận đã được gửi đến email của bạn.</p>
            </div>

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
                    <strong>{bookingDetails.numberOfNights} đêm</strong>
                </div>
                <div style={infoRowStyle}>
                    <span>Nhận phòng:</span>
                    <span>{formatDate(bookingDetails.checkInDate)}</span>
                </div>
                <div style={infoRowStyle}>
                    <span>Trả phòng:</span>
                    <span>{formatDate(bookingDetails.checkOutDate)}</span>
                </div>
                <hr />

                <div style={{ ...infoRowStyle, fontSize: '1.4rem', fontWeight: 'bold' }}>
                    <span>Tổng thanh toán:</span>
                    <strong style={{ color: '#d9534f' }}>{bookingDetails.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</strong>
                </div>
            </div>

            {/* THAY ĐỔI Ở ĐÂY */}
            <div style={actionsStyle}>
                <Link href="/" style={buttonStyle}>Về trang chủ</Link>
                <Link href="/my-booking" style={secondaryButtonStyle}>Xem lịch sử đặt phòng</Link>
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