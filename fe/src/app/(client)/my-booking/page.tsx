// src/app/my-bookings/page.tsx

'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, BookingResponse, PagedResponse } from '@/service/bookingService';
import styles from './MyBookings.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatePicker from 'react-datepicker';
import { useRouter } from 'next/navigation';

function RescheduleModal({ booking, onClose, onRescheduleSuccess }: { booking: BookingResponse, onClose: () => void, onRescheduleSuccess: () => void }) {
    // Component Modal không thay đổi
    const [newCheckIn, setNewCheckIn] = useState<Date | null>(new Date(booking.checkInDate));
    const [newCheckOut, setNewCheckOut] = useState<Date | null>(new Date(booking.checkOutDate));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!newCheckIn || !newCheckOut) {
            setError('Vui lòng chọn ngày nhận và trả phòng mới.');
            return;
        }
        if (newCheckOut <= newCheckIn) {
            setError('Ngày trả phòng phải sau ngày nhận phòng.');
            return;
        }

        if (!confirm('Bạn có chắc chắn muốn đổi lịch không? Phí đổi lịch và chênh lệch giá (nếu có) sẽ được áp dụng theo chính sách của khách sạn.')) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                newCheckInDate: newCheckIn.toISOString().split('T')[0],
                newCheckOutDate: newCheckOut.toISOString().split('T')[0],
            };
            const response = await bookingService.rescheduleBooking(booking.id, payload);

            if (response.paymentUrl) {
                alert(`Đổi lịch cần thanh toán thêm ${response.priceDifference.toLocaleString('vi-VN')} VND. Bạn sẽ được chuyển đến trang thanh toán để hoàn tất.`);
                window.location.href = response.paymentUrl;
            } else {
                let successMessage = 'Đổi lịch thành công!';
                if (response.priceDifference < 0) {
                    successMessage += ` Một khoản tiền ${(-response.priceDifference).toLocaleString('vi-VN')} VND sẽ được hoàn lại cho bạn.`;
                }
                alert(successMessage);
                onRescheduleSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Đã có lỗi xảy ra.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h2>Đổi lịch cho đơn hàng #{booking.id.substring(0, 8)}...</h2>
                <p>Khách sạn: <strong>{booking.hotel.name}</strong></p>
                <div className={styles.datePickerGroup}>
                    <div className={styles.datePickerWrapper}>
                        <label>Ngày nhận phòng mới</label>
                        <ReactDatePicker selected={newCheckIn} onChange={(date) => setNewCheckIn(date)} minDate={new Date()} dateFormat="dd/MM/yyyy" className={styles.datePickerInput} />
                    </div>
                    <div className={styles.datePickerWrapper}>
                        <label>Ngày trả phòng mới</label>
                        <ReactDatePicker selected={newCheckOut} onChange={(date) => setNewCheckOut(date)} minDate={newCheckIn ? new Date(newCheckIn.getTime() + 86400000) : new Date()} dateFormat="dd/MM/yyyy" className={styles.datePickerInput} />
                    </div>
                </div>

                <p className={styles.policyWarning}>Lưu ý: Bạn sẽ phải trả thêm chi phí nếu đổi lịch theo chính sách của khách sạn.</p>
                {error && <p className={styles.modalError}>{error}</p>}

                <div className={styles.modalActions}>
                    <button onClick={onClose} disabled={isSubmitting} className={styles.modalButtonCancel}>Hủy</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className={styles.modalButtonConfirm}>
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function MyBookingsComponent() {
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [bookingsData, setBookingsData] = useState<PagedResponse<BookingResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        setError('');
        try {
            const data = await bookingService.getBookings({
                'user-id': user.id, 'page': 0, 'size': 20, 'sort-by': 'created-at', 'sort-dir': 'desc',
            });
            setBookingsData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!isAuthLoading) {
            if (isLoggedIn && user?.id) { fetchBookings(); } else { router.push('/'); }
        }
    }, [user, isLoggedIn, isAuthLoading, router, fetchBookings]);

    const handleCancelBooking = async (bookingId: string) => {
        if (confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này? Tiền hoàn lại (nếu có) sẽ được tính theo chính sách hủy của khách sạn.')) {
            try {
                await bookingService.cancelBooking(bookingId);
                alert('Yêu cầu hủy phòng đã được gửi thành công!');
                fetchBookings();
            } catch (err: any) {
                alert(`Lỗi: ${err.message}`);
            }
        }
    };

    const handleToggleDetails = (bookingId: string) => {
        setExpandedBookingId(prevId => (prevId === bookingId ? null : bookingId));
    };

    const handleOpenRescheduleModal = (booking: BookingResponse) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');
    const formatDateTime = (dateTimeString: string) => new Date(dateTimeString).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Function để translate booking status theo API docs
    const getBookingStatusText = (status: string): string => {
        const statusMap: Record<string, string> = {
            'pending_payment': 'Chờ thanh toán',
            'confirmed': 'Đã xác nhận',
            'checked_in': 'Đã nhận phòng',
            'cancelled': 'Đã hủy',
            'completed': 'Hoàn thành',
            'rescheduled': 'Đã đổi lịch'
        };
        return statusMap[status.toLowerCase()] || status;
    };

    if (isAuthLoading || isLoading) {
        return <div className={styles.centered}>Đang tải lịch sử đặt phòng...</div>;
    }

    if (error) {
        return <div className={styles.centered}>{error}</div>;
    }

    if (!bookingsData || bookingsData.content.length === 0) {
        return <div className={styles.centered}>Quý khách hiện chưa thực hiện thao tác đặt phòng.</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <h1>Lịch sử đặt phòng</h1>
            {bookingsData.content.map(booking => {
                const isExpanded = expandedBookingId === booking.id;
                const roomImage = booking.room?.photos?.[0]?.photos?.[0]?.url;

                return (
                    <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.cardHeader}>
                            <h3>{booking.hotel.name}</h3>
                            <div className={styles.headerRight}>
                                <span className={`${styles.status} ${styles[booking.status.toLowerCase().replace(/_/g, '')]}`}>
                                    {getBookingStatusText(booking.status)}
                                </span>
                                <button onClick={() => handleToggleDetails(booking.id)} className={`${styles.toggleButton} ${isExpanded ? styles.expanded : ''}`}>
                                    ^
                                </button>
                            </div>
                        </div>

                        <div className={styles.cardBody}>
                            <div className={styles.infoGrid}>
                                <p><strong>Mã đơn hàng:</strong> {booking.id.substring(0, 8)}...</p>
                                <p><strong>Thời gian đặt:</strong> {formatDateTime(booking.createdAt)}</p>
                                <p><strong>Phòng:</strong> {booking.room.name}</p>

                                {/* THAY ĐỔI 1: Tách lịch trình thành 2 dòng riêng biệt */}
                                <p><strong>Nhận phòng:</strong> {formatDate(booking.checkInDate)} (sau 14:00)</p>
                                <p><strong>Trả phòng:</strong> {formatDate(booking.checkOutDate)} (trước 12:00)</p>

                                <p className={styles.fullRow}>
                                    <strong>Tổng tiền:</strong> <span className={styles.finalPrice}>{booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</span>
                                </p>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className={styles.detailsContainer}>
                                <hr className={styles.divider} />
                                {roomImage && <div className={styles.bookingImage}><Image src={roomImage} alt={booking.room.name} width={200} height={120} style={{ objectFit: 'cover', borderRadius: '4px' }} /></div>}
                                <h4>Chi tiết phòng</h4>
                                <p><strong>Số khách:</strong> {booking.numberOfAdults} người lớn{booking.numberOfChildren > 0 ? `, ${booking.numberOfChildren} trẻ em` : ''}</p>
                                {booking.room.amenities && booking.room.amenities.length > 0 && (
                                    <>
                                        <p><strong>Tiện nghi chính:</strong></p>
                                        <div className={styles.amenityList}>
                                            {booking.room.amenities.flatMap(group => group.amenities).slice(0, 5).map((amenity, index) => (
                                                <span key={index} className={styles.amenityTag}>{amenity.name}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className={styles.cardActions}>
                            <button onClick={() => router.push(`/payment/success?bookingId=${booking.id}`)} className={styles.actionButton}>Xem chi tiết</button>
                            {(booking.status.toLowerCase() === 'confirmed' || booking.status.toLowerCase() === 'rescheduled') &&
                                <>
                                    <button onClick={() => handleOpenRescheduleModal(booking)} className={`${styles.actionButton} ${styles.reschedule}`}>Đổi lịch</button>
                                    <button onClick={() => handleCancelBooking(booking.id)} className={`${styles.actionButton} ${styles.cancel}`}>Hủy phòng</button>
                                </>
                            }
                        </div>
                    </div>
                )
            })}

            {isModalOpen && selectedBooking && (
                <RescheduleModal booking={selectedBooking} onClose={() => setIsModalOpen(false)} onRescheduleSuccess={fetchBookings} />
            )}
        </div>
    );
}

export default function MyBookingsPage() {
    return (
        <Suspense fallback={<div className={styles.centered}>Đang tải trang...</div>}>
            <MyBookingsComponent />
        </Suspense>
    );
}