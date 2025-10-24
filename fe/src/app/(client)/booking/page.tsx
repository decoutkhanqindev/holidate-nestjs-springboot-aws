'use client';

import { Suspense, useState, ChangeEvent, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './BookingPage.module.css';
import { bookingService } from '@/service/bookingService';
import { useAuth } from '@/contexts/AuthContext';
import { hotelService, RoomDetailResponse } from '@/service/hotelService';

function BookingComponent() {
    const searchParams = useSearchParams();
    const { user, isLoggedIn } = useAuth();

    const [customerInfo, setCustomerInfo] = useState({ fullName: '', email: '', phone: '' });
    const [formErrors, setFormErrors] = useState({ fullName: '', email: '', phone: '' });
    const [specialRequests, setSpecialRequests] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const [roomDetails, setRoomDetails] = useState<RoomDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const roomId = searchParams.get('roomId');
    const price = searchParams.get('price');
    const checkin = searchParams.get('checkin');
    const nights = searchParams.get('nights');
    const hotelName = searchParams.get('hotelName');
    const hotelImageUrl = searchParams.get('hotelImageUrl');
    const includesBreakfast = searchParams.get('breakfast') === 'true';

    useEffect(() => {
        if (isLoggedIn && user) {
            setCustomerInfo(prevInfo => ({
                ...prevInfo,
                fullName: user.fullName || '',
                email: user.email || '',
            }));
        }
    }, [isLoggedIn, user]);

    useEffect(() => {
        if (roomId) {
            setIsLoading(true);
            hotelService.getRoomById(roomId)
                .then(data => {
                    setRoomDetails(data);
                })
                .catch(err => {
                    console.error("Lỗi khi tải chi tiết phòng:", err);
                    setGeneralError("Không thể tải được thông tin chi tiết của phòng.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [id]: value }));
        if (formErrors[id as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

    const handleSpecialRequestChange = (request: string, checked: boolean) => {
        if (checked) {
            setSpecialRequests(prev => [...prev, request]);
        } else {
            setSpecialRequests(prev => prev.filter(r => r !== request));
        }
    };

    const validateForm = () => { /* ... giữ nguyên hàm validate ... */ return true; };
    const handleSubmitBooking = () => { if (validateForm()) setCurrentStep(2); };
    const handleFinalPayment = async () => { /* ... giữ nguyên hàm thanh toán ... */ };

    if (isLoading) {
        return <div className={styles.centered}>Đang tải thông tin đặt phòng...</div>;
    }

    if (generalError || !roomDetails || !price || !nights || !checkin) {
        return <div className={styles.centered}>{generalError || "Thiếu thông tin để hiển thị trang."}</div>;
    }

    const numNights = parseInt(nights, 10);
    const numGuests = roomDetails.maxAdults;
    const roomName = roomDetails.name;

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkinDate);
    checkoutDate.setDate(checkoutDate.getDate() + numNights);
    const pricePerNight = parseFloat(price);
    const totalPriceForNights = pricePerNight * numNights;
    const taxAndFee = totalPriceForNights * 0.1;
    const finalPrice = totalPriceForNights + taxAndFee;
    const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

    return (
        <div className={styles.pageContainer}>
            <div className={styles.stepper}>
                <span><span className={currentStep === 1 ? styles.stepNumberActive : styles.stepNumber}>1</span> Đặt</span>
                <span className={styles.stepSeparator}>&gt;</span>
                <span><span className={currentStep === 2 ? styles.stepNumberActive : styles.stepNumber}>2</span> Thanh toán</span>
                <span className={styles.stepSeparator}>&gt;</span>
                <span><span className={currentStep === 3 ? styles.stepNumber : styles.stepNumber}>3</span> Gửi phiếu xác nhận</span>
            </div>

            <h1 className={styles.pageTitle}>{currentStep === 1 ? 'Đặt phòng của bạn' : 'Xác nhận và Thanh toán'}</h1>
            <p className={styles.pageSubtitle}>
                {currentStep === 1
                    ? 'Hãy đảm bảo tất cả thông tin chi tiết trên trang này đã chính xác trước khi tiến hành thanh toán.'
                    : 'Vui lòng xác nhận lại lần cuối trước khi thanh toán.'
                }
            </p>

            {generalError && <div className={styles.generalError}>{generalError}</div>}

            <div className={styles.mainLayout}>
                <div className={styles.leftColumn}>
                    {isLoggedIn && user ? (
                        <div className={styles.infoBox}>
                            <div className={styles.userInfo}>
                                <span className={styles.userAvatar}>{user.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                                <div>
                                    <strong>{user.fullName} thân mến!</strong> Bạn đang đặt phòng với tài khoản:
                                    <br />
                                    <span className={styles.userEmail}>{user.email}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.infoBox}>
                            <div className={styles.userInfo}>
                                <span className={styles.userAvatar}>G</span>
                                <div>
                                    <strong>Khách hàng thân mến!</strong>
                                    <br />
                                    <a href="#">Đăng nhập hoặc Đăng ký</a> để nhận thêm nhiều ưu đãi.
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <>
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Thông tin liên hệ (đối với E-voucher)</h2>
                                <div className={styles.formGroup}>
                                    <label htmlFor="fullName">Tên đầy đủ</label>
                                    <input type="text" id="fullName" value={customerInfo.fullName} onChange={handleInputChange} />
                                    {formErrors.fullName && <p className={styles.errorText}>{formErrors.fullName}</p>}
                                </div>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">E-mail</label>
                                        <input type="email" id="email" value={customerInfo.email} onChange={handleInputChange} />
                                        {formErrors.email && <p className={styles.errorText}>{formErrors.email}</p>}
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">Số điện thoại</label>
                                        <div className={styles.phoneInput}>
                                            <select><option>+84</option></select>
                                            <input type="tel" id="phone" value={customerInfo.phone} onChange={handleInputChange} placeholder="Số điện thoại liên lạc" />
                                        </div>
                                        {formErrors.phone && <p className={styles.errorText}>{formErrors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Tiện nghi và Đặc điểm phòng</h2>
                                <div className={styles.amenitiesList}>
                                    {roomDetails.view && (
                                        <div className={styles.amenityItem}>
                                            <i className="bi bi-image" style={{ color: '#0d6efd' }}></i>
                                            <strong>Hướng nhìn:</strong> {roomDetails.view}
                                        </div>
                                    )}
                                    {roomDetails.area > 0 && (
                                        <div className={styles.amenityItem}>
                                            <i className="bi bi-rulers" style={{ color: '#0d6efd' }}></i>
                                            <strong>Diện tích:</strong> {roomDetails.area} m²
                                        </div>
                                    )}
                                    <hr className={styles.divider} />
                                    <p><strong>Phòng của bạn bao gồm:</strong></p>
                                    <div className={styles.checkboxGrid}>
                                        {(roomDetails.amenities?.flatMap(group => group.amenities) || []).map(amenity => (
                                            <span key={amenity.id} className={styles.amenityTag}>
                                                ✔️ {amenity.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Bạn có yêu cầu đặc biệt nào không?</h2>
                                <div className={styles.checkboxGrid}>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Phòng không hút thuốc" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Phòng không hút thuốc</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Phòng liền thông" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Phòng liền thông</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Yêu cầu tầng lầu" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Tầng lầu</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Yêu cầu loại giường" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Loại giường</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Yêu cầu giờ nhận phòng" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Giờ nhận phòng</label>
                                    <label className={styles.checkboxLabel}><input type="checkbox" value="Yêu cầu giờ trả phòng" onChange={(e) => handleSpecialRequestChange(e.target.value, e.target.checked)} /> Giờ trả phòng</label>
                                </div>
                            </div>
                        </>
                    )}

                    {currentStep === 2 && (
                        <div className={styles.confirmationSection}>
                            <h2 className={styles.sectionTitle}>Xác nhận thông tin</h2>
                            <p><strong>Người liên hệ:</strong> {customerInfo.fullName}</p>
                            <p><strong>Email:</strong> {customerInfo.email}</p>
                            <p><strong>Điện thoại:</strong> {customerInfo.phone}</p>
                            <p><strong>Yêu cầu đặc biệt:</strong> {specialRequests.join(', ') || 'Không có'}</p>
                            <hr />
                            <p>Tổng số tiền thanh toán của bạn là <strong>{finalPrice.toLocaleString('vi-VN')} VND</strong>.</p>
                            <p>Nhấn "Xác nhận & Thanh toán" để được chuyển đến cổng thanh toán an toàn.</p>
                        </div>
                    )}

                    <div className={styles.finalPriceSection}>
                        <h2 className={styles.sectionTitle}>Chi tiết giá</h2>
                        <div className={styles.priceDetailsContainer}>
                            <div className={styles.priceRow}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Giá phòng</p>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>(1x) {roomName} ({numNights} đêm)</p>
                                </div>
                                <span>{totalPriceForNights.toLocaleString('vi-VN')} VND</span>
                            </div>
                            <div className={styles.priceRow}>
                                <span>Thuế và phí</span>
                                <span>{taxAndFee.toLocaleString('vi-VN')} VND</span>
                            </div>
                            <hr className={styles.divider} />
                            <div className={`${styles.priceRow} ${styles.totalPrice}`}>
                                <span>Tổng giá</span>
                                <span>{finalPrice.toLocaleString('vi-VN')} VND</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        {currentStep === 1 && (
                            <button className={styles.continueButton} onClick={handleSubmitBooking}>
                                Tiếp tục
                            </button>
                        )}
                        {currentStep === 2 && (
                            <div className={styles.paymentActions}>
                                <button className={styles.backButton} onClick={() => setCurrentStep(1)} disabled={isSubmitting}>
                                    Quay lại
                                </button>
                                <button className={styles.continueButton} onClick={handleFinalPayment} disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang chuyển hướng...' : 'Xác nhận & Thanh toán'}
                                </button>
                            </div>
                        )}
                        <p className={styles.legalText}>
                            Bằng việc chấp nhận thanh toán, bạn đã đồng ý với <a href="#">Điều khoản & Điều kiện</a>, <a href="#">Chính sách quyền riêng tư</a> và <a href="#">Quy trình hoàn tiền</a>.
                        </p>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.summaryCard}>
                        <div className={styles.hotelInfo}>
                            <h3 className={styles.hotelName}>{hotelName}</h3>
                            <div className={styles.hotelImage}>
                                <Image src={hotelImageUrl || '/placeholder.svg'} alt={hotelName || "Hotel Image"} layout="fill" objectFit="cover" />
                            </div>
                        </div>
                        <div className={styles.bookingDates}>
                            <div><strong>Nhận phòng</strong><p>{formatDate(checkinDate)}</p><p>Từ 14:00</p></div>
                            <div style={{ color: '#666', fontSize: 14 }}>{numNights} đêm</div>
                            <div><strong>Trả phòng</strong><p>{formatDate(checkoutDate)}</p><p>Trước 12:00</p></div>
                        </div>
                        <div className={styles.roomDetails}>
                            <p className={styles.roomName}>(1x) {roomName}</p>
                            <p>👤 {numGuests} khách</p>
                            <p>🛏️ {roomDetails.bedType?.name || 'Giường phù hợp'}</p>
                            {includesBreakfast ? <p>✔️ Đã bao gồm bữa sáng</p> : <p>❌ Không bao gồm bữa sáng</p>}
                        </div>
                        <div className={styles.summaryPriceBox}>
                            <div className={styles.summaryPriceLabel}>
                                <h4>Tổng Giá Phòng</h4>
                                <p>1 phòng, {numNights} đêm</p>
                            </div>
                            <div className={styles.priceValues}>
                                <span className={styles.finalPrice}>{finalPrice.toLocaleString('vi-VN')} VND</span>
                                <span className={styles.bestPriceTag}>Giá tốt nhất</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div className={styles.centered}>Đang tải trang đặt phòng...</div>}>
            <BookingComponent />
        </Suspense>
    );
}