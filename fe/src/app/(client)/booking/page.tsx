'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { hotelService, HotelResponse } from '@/service/hotelService';
import styles from './BookingPage.module.css';

// Component con để xử lý logic
function BookingComponent() {
    const searchParams = useSearchParams();

    // THAY ĐỔI 1: Lấy tất cả các tham số từ URL
    const hotelId = searchParams.get('hotelId');
    const roomId = searchParams.get('roomId');
    const roomName = searchParams.get('roomName');
    const price = searchParams.get('price');
    const checkin = searchParams.get('checkin');
    const nights = searchParams.get('nights');
    const guests = searchParams.get('guests');
    const includesBreakfast = searchParams.get('breakfast') === 'true';


    const [hotel, setHotel] = useState<HotelResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // THAY ĐỔI 2: Kiểm tra tất cả các tham số cần thiết
        if (hotelId && roomId && price && checkin && nights && guests) {
            setLoading(true);
            hotelService.getHotelById(hotelId)
                .then(data => setHotel(data))
                .catch(() => setError('Không thể tải thông tin khách sạn.'))
                .finally(() => setLoading(false));
        } else {
            setError('Thiếu thông tin để đặt phòng. Vui lòng thử lại.');
            setLoading(false);
        }
    }, [hotelId, roomId, price, checkin, nights, guests]);

    if (loading) return <div className={styles.centered}>Đang tải thông tin đặt phòng...</div>;
    if (error) return <div className={styles.centered}>{error}</div>;
    if (!hotel) return <div className={styles.centered}>Không tìm thấy thông tin khách sạn.</div>;

    // THAY ĐỔI 3: Sử dụng dữ liệu từ URL để tính toán và hiển thị
    const numNights = parseInt(nights || '1', 10);
    const numGuests = parseInt(guests || '2', 10);
    const checkinDate = new Date(checkin || new Date());
    const checkoutDate = new Date(checkinDate);
    checkoutDate.setDate(checkoutDate.getDate() + numNights);

    const pricePerNight = parseFloat(price || '0');
    const totalPriceForNights = pricePerNight * numNights;
    const taxAndFee = totalPriceForNights * 0.1; // Giả sử thuế và phí là 10%
    const finalPrice = totalPriceForNights + taxAndFee;

    const formatDate = (date: Date) => date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' });

    return (
        <div className={styles.pageContainer}>
            {/* ... (Phần stepper và tiêu đề giữ nguyên) ... */}
            <div className={styles.stepper}>
                <span><span className={styles.stepNumberActive}>1</span> Đặt</span>
                <span className={styles.stepSeparator}>&gt;</span>
                <span><span className={styles.stepNumber}>2</span> Thanh toán</span>
                <span className={styles.stepSeparator}>&gt;</span>
                <span><span className={styles.stepNumber}>3</span> Gửi phiếu xác nhận</span>
            </div>

            <h1 className={styles.pageTitle}>Đặt phòng của bạn</h1>
            <p className={styles.pageSubtitle}>Hãy đảm bảo tất cả thông tin chi tiết trên trang này đã chính xác trước khi tiến hành thanh toán.</p>

            <div className={styles.mainLayout}>
                {/* === CỘT TRÁI: FORM THÔNG TIN (Giữ nguyên) === */}
                <div className={styles.leftColumn}>
                    <div className={styles.infoBox}>
                        <div className={styles.userInfo}>
                            <span className={styles.userAvatar}>P</span>
                            <div>
                                <strong>Phu Quoc thân mến!</strong> Hãy tận hưởng những đặc quyền này với tư cách là Thành viên Bronze của Traveloka.
                                <br />
                                <a href="#">Đăng nhập bằng Phu Quoc (Google)</a>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Thông tin liên hệ (đối với E-voucher)</h2>
                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Tên đầy đủ (theo Hộ chiếu/Thẻ căn cước công dân)</label>
                            <input type="text" id="fullName" placeholder="ví dụ: John Maeda" />
                        </div>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">E-mail</label>
                                <input type="email" id="email" placeholder="ví dụ: email@example.com" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">Số điện thoại</label>
                                <div className={styles.phoneInput}>
                                    <select><option>+84</option></select>
                                    <input type="tel" id="phone" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Bạn yêu cầu nào không?</h2>
                        <div className={styles.checkboxGrid}>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Phòng không hút thuốc</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Phòng liền thông</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Tầng lầu</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Loại giường</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Giờ nhận phòng</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Giờ trả phòng</label>
                            <label className={styles.checkboxLabel}><input type="checkbox" /> Khác</label>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Chọn thời điểm bạn muốn thanh toán</h2>
                        <div className={styles.radioOption}>
                            <input type="radio" id="payLater" name="payment" />
                            <label htmlFor="payLater">
                                <strong>Thanh toán sau vào ngày 26 Oct 2025</strong>
                                <p>Đặt chỗ mà không cần thanh toán ngay hôm nay! Xác nhận yêu cầu đặt chỗ bằng Thẻ tín dụng hoặc PayLater. Thẻ chỉ bị trừ tiền vào ngày nêu trên.</p>
                            </label>
                        </div>
                        <div className={styles.radioOption}>
                            <input type="radio" id="payNow" name="payment" defaultChecked />
                            <label htmlFor="payNow">
                                <strong>Thanh toán ngay</strong>
                                <p>Hoàn tất thanh toán bằng Thẻ tín dụng/ghi nợ, Chuyển khoản ngân hàng hoặc các phương thức khả dụng khác.</p>
                            </label>
                        </div>
                    </div>

                    {/* === KHỐI CHI TIẾT GIÁ & NÚT BẤM === */}
                    <div className={styles.finalPriceSection}>
                        <h2 className={styles.sectionTitle}>Chi tiết giá</h2>
                        <div className={styles.priceDetailsContainer}>
                            <div className={styles.priceRow}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Giá phòng</p>
                                    {/* THAY ĐỔI 4: Hiển thị tên phòng và số đêm chính xác */}
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
                        <button className={styles.continueButton}>Tiếp tục thanh toán</button>
                        <p className={styles.legalText}>
                            Bằng việc chấp nhận thanh toán, bạn đã đồng ý với <a href="#">Điều khoản & Điều kiện</a>, <a href="#">Chính sách quyền riêng tư</a> và <a href="#">Quy trình hoàn tiền</a>.
                        </p>
                    </div>
                </div>

                {/* === CỘT PHẢI: TÓM TẮT ĐẶT PHÒNG === */}
                <div className={styles.rightColumn}>
                    <div className={styles.summaryCard}>
                        <div className={styles.hotelInfo}>
                            <h3 className={styles.hotelName}>{hotel.name}</h3>
                            <div className={styles.hotelRating}>⭐ {hotel.averageScore?.toFixed(1) || '0.0'} ({hotel.totalReviews || 0})</div>
                            <div className={styles.hotelImage}>
                                <Image src={hotel.photos?.[0]?.photos?.[0]?.url || '/placeholder.svg'} alt={hotel.name} layout="fill" objectFit="cover" />
                            </div>
                        </div>

                        <div className={styles.bookingDates}>
                            <div><strong>Nhận phòng</strong><p>{formatDate(checkinDate)}</p><p>Từ 14:00</p></div>
                            <div style={{ color: '#666', fontSize: 14 }}>{numNights} đêm</div>
                            <div><strong>Trả phòng</strong><p>{formatDate(checkoutDate)}</p><p>Trước 12:00</p></div>
                        </div>

                        {/* THAY ĐỔI 5: Hiển thị thông tin phòng đã chọn chính xác */}
                        <div className={styles.roomDetails}>
                            <p className={styles.roomName}>(1x) {roomName || 'Phòng đã chọn'}</p>
                            <p>👤 {numGuests} khách</p>
                            <p>🛏️ 1 giường đôi</p>
                            {includesBreakfast ? (
                                <p>✔️ Đã bao gồm bữa sáng</p>
                            ) : (
                                <p>❌ Không bao gồm bữa sáng</p>
                            )}
                            <p>✔️ Chọn thời điểm bạn muốn thanh toán</p>
                        </div>

                        <div className={styles.summaryPriceBox}>
                            <div className={styles.summaryPriceLabel}>
                                <h4>Tổng Giá Phòng</h4>
                                <p>1 phòng, {numNights} đêm</p>
                            </div>
                            <div className={styles.priceValues}>
                                {/* Bỏ giá gạch ngang vì không có dữ liệu này từ URL */}
                                <span className={styles.finalPrice}>
                                    {finalPrice.toLocaleString('vi-VN')} VND
                                </span>
                                <span className={styles.bestPriceTag}>Giá tốt nhất</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Bọc component trong Suspense (giữ nguyên)
export default function BookingPage() {
    return (
        <Suspense fallback={<div className={styles.centered}>Đang tải trang đặt phòng...</div>}>
            <BookingComponent />
        </Suspense>
    );
}