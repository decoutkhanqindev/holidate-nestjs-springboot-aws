// src/app/my-bookings/page.tsx

'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService, BookingResponse, PagedResponse } from '@/service/bookingService';
import { hotelService, HotelPolicy } from '@/service/hotelService';
// Không cần import CreateReviewForm và reviewService nữa vì sẽ xử lý ở trang detail
import styles from './MyBookings.module.css';
import 'react-datepicker/dist/react-datepicker.css';
import ReactDatePicker from 'react-datepicker';
import { useRouter } from 'next/navigation';

function RescheduleModal({ booking, onClose, onRescheduleSuccess }: { booking: BookingResponse, onClose: () => void, onRescheduleSuccess: () => void }) {
    const [newCheckIn, setNewCheckIn] = useState<Date | null>(new Date(booking.checkInDate));
    const [newCheckOut, setNewCheckOut] = useState<Date | null>(new Date(booking.checkOutDate));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [pricePreview, setPricePreview] = useState<{ priceDifference: number; rescheduleFee?: number; oldPrice: number; newPrice?: number } | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Tính số đêm mới
    const calculateNights = (checkIn: Date | null, checkOut: Date | null): number => {
        if (!checkIn || !checkOut) return 0;
        const diffTime = checkOut.getTime() - checkIn.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleSubmit = async () => {
        if (!newCheckIn || !newCheckOut) {
            setError('Vui lòng chọn ngày nhận và trả phòng mới.');
            return;
        }
        if (newCheckOut <= newCheckIn) {
            setError('Ngày trả phòng phải sau ngày nhận phòng.');
            return;
        }

        // Hiển thị thông báo chi tiết hơn về chi phí
        const oldNights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24));
        const newNights = calculateNights(newCheckIn, newCheckOut);

        let confirmMessage = 'Bạn có chắc chắn muốn đổi lịch không?\n\n';
        confirmMessage += `📅 Lịch trình hiện tại: ${oldNights} đêm (${new Date(booking.checkInDate).toLocaleDateString('vi-VN')} - ${new Date(booking.checkOutDate).toLocaleDateString('vi-VN')})\n`;
        confirmMessage += `📅 Lịch trình mới: ${newNights} đêm (${newCheckIn.toLocaleDateString('vi-VN')} - ${newCheckOut.toLocaleDateString('vi-VN')})\n`;
        confirmMessage += `💰 Giá đã thanh toán: ${booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND\n\n`;
        confirmMessage += `⚠️ Lưu ý:\n`;
        confirmMessage += `• Giá phòng có thể khác nhau theo ngày (ngày cao điểm giá cao hơn)\n`;
        confirmMessage += `• Có thể áp dụng phí đổi lịch theo chính sách khách sạn\n`;
        confirmMessage += `• Mã giảm giá ban đầu có thể không được áp dụng lại\n`;
        confirmMessage += `• Bạn sẽ cần thanh toán thêm nếu giá mới cao hơn`;

        if (!confirm(confirmMessage)) {
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
                // Hiển thị thông báo chi tiết hơn
                const additionalInfo = response.priceDifference > 0
                    ? `\n\n📊 Chi tiết:\n` +
                    `• Giá đã thanh toán: ${booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND\n` +
                    `• Số tiền cần thanh toán thêm: ${response.priceDifference.toLocaleString('vi-VN')} VND\n` +
                    `• Tổng giá sau đổi lịch: ${(booking.priceDetails.finalPrice + response.priceDifference).toLocaleString('vi-VN')} VND\n\n` +
                    `💡 Lý do có thể cao hơn:\n` +
                    `• Giá phòng theo ngày mới có thể cao hơn (ngày cao điểm)\n` +
                    `• Phí đổi lịch theo chính sách khách sạn\n` +
                    `• Mã giảm giá ban đầu có thể không được áp dụng lại`
                    : '';

                if (confirm(`Đổi lịch cần thanh toán thêm ${response.priceDifference.toLocaleString('vi-VN')} VND.${additionalInfo}\n\nBạn sẽ được chuyển đến trang thanh toán để hoàn tất.`)) {
                    window.location.href = response.paymentUrl;
                } else {
                    setIsSubmitting(false);
                }
            } else {
                let successMessage = '✅ Đổi lịch thành công!';
                if (response.priceDifference < 0) {
                    successMessage += `\n\n💰 Một khoản tiền ${(-response.priceDifference).toLocaleString('vi-VN')} VND sẽ được hoàn lại cho bạn.`;
                } else if (response.priceDifference === 0) {
                    successMessage += `\n\n💰 Không có chênh lệch giá. Đổi lịch miễn phí!`;
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

                <div className={styles.priceInfoBox}>
                    <p className={styles.priceInfoTitle}>💡 Thông tin về giá đổi lịch:</p>
                    <ul className={styles.priceInfoList}>
                        <li>💰 Giá phòng có thể khác nhau theo ngày (ngày cao điểm thường giá cao hơn)</li>
                        <li>📅 Khi đổi lịch, hệ thống sẽ tính lại giá cho ngày mới</li>
                        <li>💸 Có thể áp dụng phí đổi lịch theo chính sách khách sạn</li>
                        <li>🎫 Mã giảm giá ban đầu có thể không được áp dụng lại cho ngày mới</li>
                        <li>📊 Số tiền thanh toán thêm = (Giá mới + Phí đổi lịch) - Giá đã thanh toán</li>
                    </ul>
                    <p className={styles.currentPriceInfo}>
                        Giá đã thanh toán: <strong>{booking.priceDetails.finalPrice.toLocaleString('vi-VN')} VND</strong>
                    </p>
                </div>

                <p className={styles.policyWarning}>
                    ⚠️ Lưu ý: Bạn sẽ phải trả thêm chi phí nếu đổi lịch theo chính sách của khách sạn.
                </p>
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

// Hàm helper để kiểm tra xem khách sạn có cho phép đổi lịch không
// Dựa vào reschedulePolicy.name hoặc description
const isRescheduleAllowed = (policy: HotelPolicy | null | undefined): boolean => {
    if (!policy || !policy.reschedulePolicy) {
        // Nếu không có policy, mặc định cho phép (để backend xử lý)
        return true;
    }

    const reschedulePolicy = policy.reschedulePolicy;
    const policyName = reschedulePolicy.name?.toLowerCase() || '';
    const policyDescription = reschedulePolicy.description?.toLowerCase() || '';

    // Kiểm tra nếu policy name hoặc description chứa từ khóa "không được đổi", "không cho phép đổi", v.v.
    const blockedKeywords = [
        'không được đổi',
        'không cho phép đổi',
        'không được thay đổi',
        'không cho phép thay đổi',
        'không đổi',
        'không thay đổi'
    ];

    // Nếu policy name hoặc description chứa từ khóa chặn, thì không cho phép đổi
    const isBlocked = blockedKeywords.some(keyword =>
        policyName.includes(keyword) || policyDescription.includes(keyword)
    );

    return !isBlocked;
};

function MyBookingsComponent() {
    const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [bookingsData, setBookingsData] = useState<PagedResponse<BookingResponse> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

    // Cache để lưu hotel policies (tránh fetch nhiều lần cho cùng một hotel)
    const [hotelPoliciesCache, setHotelPoliciesCache] = useState<Record<string, HotelPolicy | null>>({});

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

    // Fetch hotel policies sau khi bookings đã được load
    useEffect(() => {
        if (!bookingsData || !bookingsData.content.length) return;

        const fetchHotelPolicies = async () => {
            const hotelIds = [...new Set(bookingsData.content.map(booking => booking.hotel.id))];

            // Chỉ fetch cho các hotel chưa có trong cache
            setHotelPoliciesCache(currentCache => {
                const hotelsToFetch = hotelIds.filter(hotelId => !currentCache[hotelId]);

                if (hotelsToFetch.length > 0) {
                    // Fetch policies cho các hotel chưa có trong cache
                    const policyPromises = hotelsToFetch.map(async (hotelId) => {
                        try {
                            const hotel = await hotelService.getHotelById(hotelId);
                            return { hotelId, policy: hotel.policy || null };
                        } catch (error) {
                            return { hotelId, policy: null };
                        }
                    });

                    Promise.all(policyPromises).then(policyResults => {
                        setHotelPoliciesCache(prevCache => {
                            const newCache: Record<string, HotelPolicy | null> = { ...prevCache };
                            policyResults.forEach(({ hotelId, policy }) => {
                                newCache[hotelId] = policy;
                            });
                            return newCache;
                        });
                    });
                }

                return currentCache; // Return current cache immediately
            });
        };

        fetchHotelPolicies();
    }, [bookingsData]);

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

    const handleOpenReviewForm = (booking: BookingResponse) => {
        // Chuyển đến trang detail hotel với bookingId để đánh giá
        router.push(`/hotels/${booking.hotel.id}?bookingId=${booking.id}&review=true`);
    };

    // Không cần handleReviewSuccess nữa vì sẽ xử lý ở trang detail

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
                                    {/* Chỉ hiển thị nút "Đổi lịch" nếu khách sạn cho phép đổi lịch */}
                                    {isRescheduleAllowed(hotelPoliciesCache[booking.hotel.id]) && (
                                        <button onClick={() => handleOpenRescheduleModal(booking)} className={`${styles.actionButton} ${styles.reschedule}`}>Đổi lịch</button>
                                    )}
                                    <button onClick={() => handleCancelBooking(booking.id)} className={`${styles.actionButton} ${styles.cancel}`}>Hủy phòng</button>
                                </>
                            }
                            {/* Chỉ hiển thị button "Đánh giá" nếu booking đã confirmed (đã thanh toán) */}
                            {booking.status.toLowerCase() === 'confirmed' && (
                                <button onClick={() => handleOpenReviewForm(booking)} className={`${styles.actionButton} ${styles.review}`}>Đánh giá</button>
                            )}
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